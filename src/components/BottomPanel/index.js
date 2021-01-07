import React, { Component } from "react";
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    Image,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Images from "../images";
import { Text } from "native-base";
import * as Easing from "react-native/Libraries/Animated/src/Easing";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "../../assets/Colors";
import ChallegeIndicator from "../ChallengeIndicator";
import { getUserChallenges, getUser } from "../../../modules/firebaseAPI";
import firebase from "firebase";
import * as challengesAPI from "../../../modules/challengesAPI.js";
import ButtonGD from "../ButtonGD";
//import AnimationTypingText from '../AnimationTypingText';
import translate from "../../../utils/language";
import { State, PanGestureHandler } from "react-native-gesture-handler";
import { NetworkConsumer } from "react-native-offline";

const { width, height } = Dimensions.get("window");

export default class BottomUpPanel extends Component {
    static defaultProps = {
        isOpen: false,
    };

    // Define state
    state = {
        open: false,
        spinValue: new Animated.Value(0),
        //  challenges: [],
        listingData: [],
        displayChallenge: true,
        animateDot: true,
        userName: "",
        updatePanel: false,
        futureChallenges: [],
    };

    config = {
        position: {
            max: height,
            start: height - this.props.startHeight,
            end: this.props.topEnd,
            min: this.props.topEnd,
            animates: [() => this._animatedHeight],
        },
        width: {
            end: width,
            start: width,
        },
        height: {
            end: height,
            start: this.props.startHeight,
        },
    };

    _animatedHeight = new Animated.Value(
        this.props.isOpen ? this.config.height.end : this.config.height.start
    );

    _animatedPosition = new Animated.Value(
        this.props.isOpen
            ? this.config.position.end
            : this.config.position.start
    );

    UNSAFE_componentWillMount() {
        this.readData();
        this._animatedPosition.addListener((value) => {
            //Every time that position changes then actualize the related properties. I.e: height, so the view
            //has the interpolated height
            this.config.position.animates.map((item) => {
                item().setValue(value.value);
            });
        });
        // Reset value once listener is registered to update depending animations
        this._animatedPosition.setValue(this._animatedPosition._value);
    }

    // Handle isOpen prop changes to either open or close the window
    UNSAFE_componentWillReceiveProps(nextProps) {
        // isOpen prop changed to true from false
        if (!this.props.isOpen && nextProps.isOpen) {
            this.open();
        }
        // isOpen prop changed to false from true
        else if (this.props.isOpen && !nextProps.isOpen) {
            this.close();
        }

        if (this.props.challengeList !== nextProps.challengeList) {
            const activeChallenges = nextProps.challengeList.filter(
                (challenge) => !challengesAPI.notStarted(challenge.daystart)
            );
            const futureChallenges = nextProps.challengeList.filter(
                (challenge) => challengesAPI.notStarted(challenge.daystart)
            );
            this.setState({
                listingData: activeChallenges,
                futureChallenges: futureChallenges,
            });
        }
    }

    onMountain(key, title, why, mountain) {
        this.props.onMountain(key, title, why, mountain);
    }

    onNewChallenge() {
        this.props.onNewChallenge();
    }

    async readData() {
        this.database = firebase.database();
        const userId = firebase.auth().currentUser.uid;
        const userData = await getUser();
        let userName = userData.name
            ? userData.name
            : firebase.auth().currentUser.email;
        const challenges = this.props.challengeList;
        const activeChallenges = challenges.filter(
            (challenge) => !challengesAPI.notStarted(challenge.daystart)
        );
        const futureChallenges = challenges.filter((challenge) =>
            challengesAPI.notStarted(challenge.daystart)
        );
        this.setState({
            userName: userName,
            listingData: activeChallenges,
            futureChallenges: futureChallenges,
            qch: 0,
        });
    }

    handleGesture = (evt) => {
        let { nativeEvent } = evt;
        if (nativeEvent.state === State.ACTIVE) {
            this.toggle();
        }
    };

    triggerAnimation = () => {
        this.setState({ triggerAnimation: true });
    };

    render() {
        const { content, goToDownloads} = this.props;

        const { userName } = this.state;
        //const userEmail = firebase.auth().currentUser.displayName.length>1? firebase.auth().currentUser.displayName : firebase.auth().currentUser.email  ;
        //const userEmail = firebase.auth().currentUser.email;

        // Height according to position
        let animatedHeight = this._animatedHeight.interpolate({
            inputRange: [this.config.position.end, this.config.position.start],
            outputRange: [this.config.height.end, this.config.height.start],
        });
        this.state.qch = 0;

        // Icon rotation
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "180deg"],
        });

        const challengesGreeting = () => {
            let greeting = "";
            if (this.state.listingData.length) {
                greeting = translate("Home.last_challenge") + ".";
            } else {
                if (this.state.futureChallenges.length) {
                    greeting = translate("Home.future_challenge") + ".";
                } else {
                    greeting = translate("Home.no_challenges") + ".";
                }
            }
            return greeting;
        };

        const createChallengeShortcut = this.state.displayChallenge ? (
            <CreateChallengeShortcut
                onNewChallenge={this.props.onNewChallenge}
            />
        ) : null;
        return (
            <PanGestureHandler
                onHandlerStateChange={this.handleGesture}
                activeOffsetY={[-80, 80]}
            >
                <Animated.View
                    style={[
                        styles.buttonUpPanelView,
                        { height: animatedHeight },
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                // Add padding at the bottom to fit all content on the screen
                                paddingBottom: this.props.topEnd,
                                width: width,
                                backgroundColor: this.state.open
                                    ? COLORS.white
                                    : "transparent",
                                // Animate position on the screen
                                transform: [
                                    { translateY: this._animatedPosition },
                                    { translateX: 0 },
                                ],
                            },
                        ]}
                    >
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={{ height: this.props.startHeight }}
                            >
                                <View
                                    style={[
                                        this.props.bottomUpSlideBtn,
                                        {
                                            width: width,
                                            height: this.props.startHeight,
                                        },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.slideContent,
                                            {
                                                borderTopLeftRadius: this.state
                                                    .open
                                                    ? 0
                                                    : 30,
                                                borderTopRightRadius: this.state
                                                    .open
                                                    ? 0
                                                    : 30,
                                                shadowOpacity: this.state.open
                                                    ? 0
                                                    : 0.8,
                                            },
                                        ]}
                                    >
                                        <NetworkConsumer>
                                            {({ isConnected }) =>
                                                isConnected ? (
                                                    <View style={{alignItems: 'center'}}>
                                                        <View
                                                            style={[
                                                                styles.dashboardView,
                                                                {
                                                                    marginTop: this
                                                                        .props
                                                                        .dashMargin,
                                                                    display: this
                                                                        .state
                                                                        .displayChallenge
                                                                        ? "flex"
                                                                        : "none",
                                                                },
                                                            ]}
                                                        >
                                                            <Image
                                                                style={{
                                                                    height: 30,
                                                                    width: 30,
                                                                    tintColor:
                                                                        COLORS.orange,
                                                                }}
                                                                source={
                                                                    Images.smile
                                                                }
                                                            ></Image>

                                                            <View
                                                                style={{
                                                                    paddingLeft: 10,
                                                                    flex: 1,
                                                                }}
                                                            >
                                                                <Text
                                                                    style={
                                                                        styles.userGreeting
                                                                    }
                                                                >
                                                                    {translate(
                                                                        "Home.hi"
                                                                    ) +
                                                                        ", " +
                                                                        userName +
                                                                        "."}
                                                                    {challengesGreeting()}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        {this.state.listingData.length ? this.state.listingData.map(
                                                                  (x) => {
                                                                      let currentday = challengesAPI.current_day(x.daystart);
                                                                      let finished = challengesAPI.finished(currentday);
                                                                      let completed = challengesAPI.completed_days(x);
                                                                      let notstarted = currentday == -1 ? (notstarted = true): (notstarted = false);
                                                                      if (
                                                                          x.active ==
                                                                          "current"
                                                                      ) {
                                                                          if (
                                                                              !notstarted &&
                                                                              !finished
                                                                          ) {
                                                                              this
                                                                                  .state
                                                                                  .qch++;
                                                                              if (
                                                                                  this
                                                                                      .state
                                                                                      .qch ==
                                                                                  1
                                                                              ) {
                                                                                  let completed = challengesAPI.completed_days(
                                                                                      x
                                                                                  );
                                                                                  return (
                                                                                      <ChallegeIndicator
                                                                                          displayChallenge={
                                                                                              this
                                                                                                  .state
                                                                                                  .displayChallenge
                                                                                          }
                                                                                          triggerAnimation={
                                                                                              this
                                                                                                  .props
                                                                                                  .triggerAnimation
                                                                                          }
                                                                                          key={
                                                                                              this
                                                                                                  .state
                                                                                                  .qch
                                                                                          }
                                                                                          daysCompleted={
                                                                                              currentday
                                                                                          }
                                                                                          title={
                                                                                              x.title
                                                                                          }
                                                                                          image={
                                                                                              x.image
                                                                                          }
                                                                                          onmountain={() =>
                                                                                              this.onMountain(
                                                                                                  x.key,
                                                                                                  x.title,
                                                                                                  x.why,
                                                                                                  x.mountain
                                                                                              )
                                                                                          }
                                                                                      />
                                                                                  );
                                                                              }
                                                                          }
                                                                      }
                                                                  }
                                                              )
                                                            : createChallengeShortcut}
                                                    </View>
                                                ) : (
                                                    <View style={{paddingLeft: 40, paddingRight: 40, marginTop: this.props.dashMargin, alignItems: 'center', display: this.state.displayChallenge ? "flex": "none",}}>
                                                        <Ionicons name="ios-wifi" color={COLORS.orange} size={30}/>
                                                        <Text style={styles.offlineDisclaimer}>
                                                        {translate("Home.offline")} <Text style={[styles.offlineDisclaimer, {textDecorationLine: 'underline'}]} onPress={goToDownloads}>{translate("Home.downloads")}</Text> {translate("Home.section")}.
                                                        </Text>
                                                    </View>
                                                )
                                            }
                                        </NetworkConsumer>
                                    </View>
                                </View>
                            </Animated.View>
                        </TouchableWithoutFeedback>

                        {/* Scrollable content */}
                        <ScrollView
                            ref={(scrollView) => {
                                this._scrollView = scrollView;
                            }}
                            // Enable scrolling only when the window is open
                            scrollEnabled={this.state.open}
                            // Hide all scrolling indicators
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            // Trigger onScroll often
                            scrollEventThrottle={16}
                            onScroll={this._handleScroll}
                        >
                            {/* Render content components */}
                            {content()}
                        </ScrollView>
                    </Animated.View>
                </Animated.View>
            </PanGestureHandler>
        );
    }

    open = () => {
        this.props.panelOpened();
        this.setState(
            { open: true, displayChallenge: false, animateDot: false },
            () => {
                Animated.timing(this._animatedPosition, {
                    toValue: this.config.position.end,
                    duration: 600,
                }).start();
                Animated.timing(this.state.spinValue, {
                    toValue: 1,
                    duration: 600,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }).start();
            }
        );
    };

    close = () => {
        this.props.panelClosed();
        this.setState({ displayChallenge: true });
        this._scrollView.scrollTo({ y: 0 });
        Animated.timing(this._animatedPosition, {
            toValue: this.config.position.start,
            duration: 600,
        }).start(() => {
            this.setState({ open: false });
        });
        Animated.timing(this.state.spinValue, {
            toValue: 0,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver: true,
        }).start();
    };

    toggle = () => {
        if (!this.state.open) {
            this.open();
        } else {
            this.close();
        }
    };
}

class CreateChallengeShortcut extends React.PureComponent {
    state = {
        itemVisible: true,
    };
    onBtnClick = () => {
        this.props.onNewChallenge();
    };
    render() {
        return (
            <ButtonGD
                title={translate("Home.createChallenge")}
                onpress={() => this.onBtnClick()}
            />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "flex-end",
        backgroundColor: "transparent",
    },
    content: {
        height: height,
    },
    buttonUpPanelView: {
        position: "absolute",
        bottom: 0,
        width: width,
        alignItems: "center",
        justifyContent: "flex-end",
        backgroundColor: "transparent",
    },
    dashboardView: {
        flexDirection: "row",
        alignItems: "center",
        width: 300,
    },
    userGreeting: {
        fontSize: 15,
        color: COLORS.gray,
        fontWeight: "bold",
    },
    slideContent: {
        flex: 1,
        alignItems: "center",
        padding: 15,
        backgroundColor: COLORS.white,
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowRadius: 30,
        shadowColor: "#000000",
    },
    offlineDisclaimer: {
        color: COLORS.black,
        textAlign: 'center',
        marginTop: 15
    }
});
