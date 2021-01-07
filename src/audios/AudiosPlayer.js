// @flow
import moment from "moment";
import * as React from "react";
import {
    View,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Alert,
} from "react-native";
import { H1, H3, Button, Text, Icon } from "native-base";
import {
    BaseContainer,
    Images,
    Styles,
    BackArrow,
    CachedImage,
} from "../components";
import {
    checkFav,
    addFav,
    removeFav,
    checkDownload,
} from "../../modules/firebaseAPI";
import { getOfflineRoute } from "../../modules/localStorageAPI";
import type { ScreenProps } from "../components/Types";
import { StackActions } from "react-navigation";
import { Ionicons } from "@expo/vector-icons";
import { Constants } from "expo";
import { Audio } from "expo-av";
import variables from "../../native-base-theme/variables/commonColor";
import COLORS from "../assets/Colors";
import { FontAwesome5 } from "@expo/vector-icons";
import * as Matomo from "react-native-matomo";
import * as commonFunctions from "../../utils/common.js";
import { Slider } from "react-native";
import { checkInternetConnection } from "react-native-offline";
import translate from "../../utils/language";

const btnPlay = Images.btn_play;
const btnPause = Images.btn_pause;

export default class AudiosPlayer extends React.PureComponent<ScreenProps<>> {
    state = {
        playingStatus: "LOADING",
        playButtonImg: btnPlay,
        controlsVisible: false,
        isFav: false,
        isDownload: false,
        startTime: 0,
        endTime: 0,
        elapsed: 0,
        elpasedMs: 0,
        elapsedPercent: 0,
        totalDuration: 0,
        totalTime: "-- : --",
        currentPosition: 0,
        elapsedTime: "00:00",
        sliderSliding: false,
    };

    start() {
        this.setState({ startTime: new Date() });
        commonFunctions.matomoTrack(
            "content",
            this.props.navigation.getParam("ptitle", "n/a")
        );
    }

    end() {
        let endTime = new Date();
        let timeDiff = endTime - this.state.startTime; //in ms
        // strip the ms
        timeDiff /= 1000;
        // get seconds
        let seconds = Math.round(timeDiff);
        this.setState({ elapsed: seconds });
    }

    async checkIfFav() {
        let isFav = await checkFav(this.props.navigation.getParam("key"));
        this.setState({ isFav: isFav });
    }

    async checkIfDownload() {
        let isDownload = await checkDownload(
            this.props.navigation.getParam("key")
        );
        this.setState({ isDownload });
    }

    promptDiscard = () => {
        const title = "Discard current meditation"; //+ this.props.navigation.state.params.title;
        const message = "Are you sure?";
        const buttons = [
            { text: "Cancel", type: "cancel" },
            { text: "Discard", onPress: () => this.handleBack() },
        ];
        Alert.alert(title, message, buttons);
    };

    alertErrorPlaying = (error) => {
        const title = "Error playing content";
        const message = error;
        Alert.alert(title, message);
    };

    promptComplete = () => {
        const title = "Complete meditation"; //+ this.props.navigation.state.params.title;
        const message = "Are you sure?";
        const buttons = [
            { text: "Cancel", type: "cancel" },
            { text: "Complete", onPress: () => this.handleFinish() },
        ];
        Alert.alert(title, message, buttons);
    };

    async componentDidMount() {
        commonFunctions.matomoTrack("screen", "audioPlayer");
        const connected = await checkInternetConnection();
        this.mounted = true;
        const { navigation } = this.props;
        this.blurListener = navigation.addListener("willBlur", () => {
            if (this.sound != null) {
                this.sound.unloadAsync();

                if (this.state.playingStatus == "PLAYING") {
                    this.setState({
                        playingStatus: "PAUSED",
                        playButtonImg: btnPlay,
                    });
                }
            }
        });

        this.focusListener = this.props.navigation.addListener(
            "didFocus",
            () => {
                if (connected) {
                    this.checkIfFav();
                }
            }
        );

        if (connected) {
            await this.checkIfDownload();
        }

        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            shouldDuckAndroid: false,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            playThroughEarpieceAndroid: false,
        });
        this._playRecording(connected);
    }

    componentWillUnmount() {
        this.mounted = false;
        if (this.sound != null) {
            this.sound.unloadAsync();
            this.blurListener.remove();
        }
    }

    async _playRecording(online) {
        let url = this.props.navigation.getParam("key", "some default value");

        if (
            !this.props.navigation.getParam("music") &&
            this.props.navigation.getParam("checkbkgmusic") == "yes"
        ) {
            url = url + "_nosounds";
        }
        const aws =
            "https://tlexeurope.s3.eu-central-1.amazonaws.com/audios/Audio/" +
            url +
            ".mp3";
        const key = this.props.navigation.getParam("key");
        const localDir = await getOfflineRoute(key, "audio");
        const source = online ? { uri: aws } : localDir;
        const { sound } = await Audio.Sound.createAsync(source, {
            shouldPlay: false,
            isLooping: false,
        }).catch(() =>
            this.alertErrorPlaying("Check your internet connection")
        );

        if (this.mounted) {
            sound.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);
            this.sound = sound;
            this.start();
            await this.sound.playAsync();
            this.setState({
                playingStatus: "PLAYING",
                playButtonImg: btnPause,
                controlsVisible: true,
            });
        }
    }

    async _pauseAndPlayRecording() {
        if (this.sound != null) {
            if (this.state.playingStatus == "PLAYING") {
                await this.sound.pauseAsync();
                this.setState({
                    playingStatus: "PAUSED",
                    playButtonImg: btnPlay,
                });
            } else {
                await this.sound.playAsync();
                this.setState({
                    playingStatus: "PLAYING",
                    playButtonImg: btnPause,
                });
            }
        }
    }

    _syncPauseAndPlayRecording() {
        if (this.sound != null) {
            if (this.state.playingStatus == "playing") {
                this.sound.pauseAsync();
            } else {
                this.sound.playAsync();
            }
        }
    }

    onSlideChanging = async (position) => {
        const millis = position * this.state.totalDuration;
        if (this.state.sliderSliding) {
            this.setState({ elapsedTime: this._msToTime(millis) });
        } else {
            this.setState({ sliderSliding: true });
            if (this.sound != null) {
                if (this.state.playingStatus == "PLAYING") {
                    await this.sound.pauseAsync();
                    this.setState({
                        playingStatus: "PAUSED",
                        elapsedTime: this._msToTime(millis),
                    });
                }
            }
        }
    };

    onSlidingComplete = async (position) => {
        this.setState({ sliderSliding: false });
        const millis = position * this.state.totalDuration;
        if (this.sound != null) {
            await this.sound.setPositionAsync(millis);
            if (this.state.playingStatus == "PAUSED") {
                await this.sound.playAsync();
                this.setState({ playingStatus: "PLAYING" });
            }
        }
    };

    _zeroFill(number, width) {
        width -= number.toString().length;
        if (width > 0) {
            return (
                new Array(width + (/\./.test(number) ? 2 : 1)).join("0") +
                number
            );
        }
        return number + ""; // always return a string
    }

    _msToTime(ms) {
        let seconds = ms / 1000;
        //let hours = parseInt( seconds / 3600 ); // 3,600 seconds in 1 hour
        //seconds = seconds % 3600; // seconds remaining after extracting hours
        let minutes = Math.trunc(seconds / 60);
        seconds = Math.trunc(seconds % 60);
        return this._zeroFill(minutes, 2) + ":" + this._zeroFill(seconds, 2);
    }

    _playAndPause = () => {
        this._pauseAndPlayRecording();
    };

    _onPlaybackStatusUpdate = (playbackStatus) => {
        if (playbackStatus.isLoaded && playbackStatus.isPlaying) {
            let timeElapsed = this._msToTime(playbackStatus.positionMillis);
            let audioProgress = 0;
            let totalDuration = 0;
            let currentPosition = 0;
            let totalTime = "--";
            if (
                !isNaN(
                    playbackStatus.positionMillis /
                        playbackStatus.durationMillis
                )
            ) {
                audioProgress =
                    playbackStatus.positionMillis /
                    playbackStatus.durationMillis;
                totalDuration = playbackStatus.durationMillis;
                totalTime = this._msToTime(totalDuration);
                currentPosition = playbackStatus.positionMillis;
            }
            this.setState({
                elapsedPercent: audioProgress,
                elapsedTime: timeElapsed,
                elapsedMs: playbackStatus.positionMillis,
                totalDuration: totalDuration,
                totalTime: totalTime,
                currentPosition: currentPosition,
            });
        }

        if (playbackStatus.didJustFinish) {
            this.handleFinish();
        }
    };

    handleGoHome() {
        this.props.navigation.dispatch(StackActions.popToTop());
    }

    handleHeartClick = async () => {
        let { isFav } = this.state;
        let category = this.props.navigation.getParam("category");
        let key = this.props.navigation.getParam("key");
        if (isFav) {
            this.setState({ isFav: false });
            await removeFav(key);
        } else {
            this.setState({ isFav: true });
            await addFav(key, "audio", category);
        }
    };

    handleBack() {
        this.props.navigation.goBack();
    }

    handleFinish() {
        this.end();
        let secondsElapsed = this.state.elapsedMs / 1000;
        let m = Math.floor((secondsElapsed % 3600) / 60);
        var s = Math.floor((secondsElapsed % 3600) % 60);
        var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        let minutes = mDisplay + sDisplay;
        this.props.navigation.navigate("Finished", {
            secondsElapsed: secondsElapsed,
            elapsed: minutes,
            photo: this.props.navigation.getParam("photo", ""),
            category: this.props.navigation.getParam(
                "category",
                "mindfullness"
            ),
            ptitle: this.props.navigation.getParam("ptitle", ""),
        });
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    render(): React.Node {
        const { navigation } = this.props;
        const key = navigation.getParam("key", "some default value");
        const photo = navigation.getParam("photo", "");
        const title = navigation.getParam("title", "");
        const today = moment();
        const date = today.format("MMMM D");
        const {
            isFav,
            elapsedPercent,
            elapsedTime,
            totalDuration,
            totalTime,
            currentPosition,
        } = this.state;

        let heartColor = COLORS.white;
        if (isFav) {
            heartColor = COLORS.orange;
        }

        return (
            <BaseContainer
                title="Meditate"
                navigation={this.props.navigation}
                noPadding
            >
                <BackArrow handleBackPress={() => this.handleBack()} />
                <View style={style.container}>
                    <View style={style.imgWrapper}>
                        <CachedImage
                            source={{ uri: photo }}
                            style={style.img}
                            title={`${key}_cover`}
                            resizeMode="cover"
                            noWrap
                        />
                        <Text style={style.audioTitle}>
                            {this.capitalize(
                                this.props.navigation.state.params.ptitle
                            )}
                        </Text>
                        <Text style={style.durationTitle}>
                            {this.props.navigation.state.params.duration}
                        </Text>
                        {/* <View style={style.seekBarWrapper}>
              <View style={{ flex: 1 }}>
                {(this.state.playingStatus === 'PLAYING' || this.state.playingStatus === 'PAUSED') ? (<Text style={{ textAlign: 'center' }}>{elapsedTime}</Text>) : <ActivityIndicator color={COLORS.white} />}
              </View>
              <View style={style.seekBarBackground}>
                <View style={[{ flex: elapsedPercent }, style.seekBarProgress]}></View>
              </View>
            </View> */}
                    </View>
                    {this.state.controlsVisible ? (
                        <View style={style.indicator}>
                            <TouchableOpacity onPress={this._playAndPause}>
                                <Image
                                    style={style.button}
                                    source={this.state.playButtonImg}
                                />
                            </TouchableOpacity>
                        </View>
                    ) : null}
                    {this.state.playingStatus === "LOADING" ? (
                        <View style={style.indicator}>
                            <ActivityIndicator size="large" color="#ffffff" />
                        </View>
                    ) : null}
                    {this.state.playingStatus !== "LOADING" && (
                        <View
                            style={{
                                position: "absolute",
                                alignItems: "center",
                                bottom: 100,
                            }}
                        >
                            <TouchableOpacity
                                style={style.infoButton}
                                onPress={() => this.handleFinish()}
                            >
                                <Text style={style.infoText}>
                                    {translate("Meditation.Complete")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                <View style={style.seekBarWrapper}>
                    <View style={{ flex: 1 }}>
                        {this.state.playingStatus === "PLAYING" ||
                        this.state.playingStatus === "PAUSED" ? (
                            <Text style={{ textAlign: "center" }}>
                                {elapsedTime}
                            </Text>
                        ) : (
                            <ActivityIndicator color={COLORS.white} />
                        )}
                    </View>
                    <View style={{ flex: 5 }}>
                        <Slider
                            style={{ flex: 1 }}
                            maximumValue={1}
                            minimumValue={0}
                            // onSlidingStart={()=>{console.log('Sliding start')}}
                            onValueChange={this.onSlideChanging}
                            onSlidingComplete={this.onSlidingComplete}
                            value={elapsedPercent}
                            minimumTrackTintColor={COLORS.orange}
                            maximumTrackTintColor={COLORS.gray}
                            thumbTintColor={COLORS.orange}
                            // thumbStyle={styles.thumb}
                            // trackStyle={styles.track}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ textAlign: "center" }}>{totalTime}</Text>
                    </View>
                </View>
            </BaseContainer>
        );
    }
}

const { width } = Dimensions.get("window");
const { height } = Dimensions.get("window");
const style = StyleSheet.create({
    audioTitle: {
        position: "absolute",
        zIndex: 100,
        left: 0,
        right: 0,
        top: 80,
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: COLORS.white,
        textShadowColor: COLORS.blue,
        textShadowOffset: { width: 5, height: 5 },
        textShadowRadius: 10,
    },

    durationTitle: {
        position: "absolute",
        zIndex: 100,
        left: 0,
        right: 0,
        top: 110,
        fontSize: 17,
        textAlign: "center",
        color: COLORS.white,
        textShadowColor: COLORS.blue,
        textShadowOffset: { width: 5, height: 5 },
        textShadowRadius: 10,
    },
    container: {
        flex: 3,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    discard: {
        flex: 1,
        alignItems: "flex-start",
        paddingLeft: 25,
    },
    Complete: {
        flex: 1,
        alignItems: "flex-end",
        paddingRight: 25,
    },
    imgWrapper: {
        alignSelf: "stretch",
        flex: 1,
    },
    img: {
        resizeMode: "cover",
        ...StyleSheet.absoluteFillObject,
    },
    btnFavWrapper: {
        position: "absolute",
        zIndex: 1000,
        top: 15,
        right: 15,
    },
    row: {
        justifyContent: "center",
        alignItems: "center",
        padding: variables.contentPadding * 2,
    },
    indicator: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    button: {
        width: 75,
        height: 75,
        opacity: 0.85,
    },
    section: {
        padding: variables.contentPadding * 2,
        borderBottomWidth: variables.borderWidth,
        borderColor: variables.listBorderColor,
        flexDirection: "row",
        alignItems: "center",
    },
    seekBarWrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 50,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        zIndex: 100,
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
        paddingLeft: 15,
        paddingRight: 15,
    },
    seekBarBackground: {
        flex: 5,
        height: 10,
        backgroundColor: COLORS.lightgray,
        flexDirection: "row",
        marginRight: 10,
    },
    seekBarProgress: {
        height: 10,
        backgroundColor: COLORS.orange,
    },
    infoButton: {
        marginTop: 10,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: COLORS.orange,
        borderRadius: 25,
        width: 170,
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "center",
    },
    infoText: {
        textAlign: "center",
        color: COLORS.white,
        fontWeight: "bold",
        marginRight: 10,
        fontSize: 13,
    },
});

// https://github.com/expo/expo/issues/1141
