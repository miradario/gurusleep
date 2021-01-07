import React, { Component } from 'react';
import { BaseContainer, Styles, BackArrow} from "../components";
import ButtonGD from "../components/ButtonGD";
import { Dimensions, Image, StyleSheet, TouchableOpacity, View, ActivityIndicator, StatusBar, ScrollView, Alert } from 'react-native';
import { H1, H3, Button, Text, Footer, FooterTab, Icon } from "native-base";
import { Video, Audio } from 'expo-av';
import WindowDimensions from "../components/WindowDimensions";
import { checkFav, addFav, removeFav, saveDownloadData, removeDownload, getDownloadsContent, checkDownload} from "../../modules/firebaseAPI";
import { storeOfflineAsset, deleteOfflineAsset, storeOfflineImages, getOfflineRoute} from "../../modules/localStorageAPI";
import variables from "../../native-base-theme/variables/commonColor";
import { TouchableHighlight } from 'react-native-gesture-handler';
import COLORS from "../assets/Colors";
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Matomo from "react-native-matomo";
import * as commonFunctions from '../../utils/common.js';
import { checkInternetConnection } from 'react-native-offline';
import Toast, { DURATION } from "react-native-easy-toast";

const btnPlay = require('../../assets/images/btn-play.png');
const btnPause = require('../../assets/images/btn-pause.png');

export default class Resources extends React.PureComponent<ScreenProps<>> {

  constructor(props) {
    super(props);

    this.state = {
      mediaState: 'LOADING',
      playButtonImg: btnPlay,
      controlsVisible: false,
      videoWidth: Dimensions.get('window').width,
      videoHeight: Dimensions.get('window').width * 0.55,
      isFav: false,
      isDownload: false,
      downloading: false,
      connected: true
    };
  }

  async componentDidMount() {
    commonFunctions.matomoTrack('screen', 'VideoPlayer');
    const { navigation } = this.props;
    const key = navigation.getParam('key');
    const connected = await checkInternetConnection();
    this.setState({connected})
    if (connected){
      await this.checkIfDownload(key)
    }
    Audio.setAudioModeAsync({
      staysActiveInBackground: false,
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
    });
    this.blurListener = navigation.addListener("willBlur", () => {
      this.vid.pauseAsync();
      this.setState({ mediaState: 'PAUSED', playButtonImg: btnPlay });
    })
  }


  handleEnd = () => {
    this.vid.seek(0);
    this.vid.pauseAsync();
    this.setState({ mediaState: 'PAUSED', playButtonImg: btnPlay, controlsVisible: true });
  }

  handleOnLoad = () => {
    this.setState({ mediaState: 'PAUSED', playButtonImg: btnPlay, controlsVisible: true });

    commonFunctions.matomoTrack('content', this.props.navigation.getParam('ptitle', 'n/a'));

  };

  handleFullscreenUpdate = async(event) => {
    if (event.fullscreenUpdate === 3) { //Fullscreen is dismissed
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      this.vid.pauseAsync();
      this.setState({ mediaState: 'PAUSED', playButtonImg: btnPlay, controlsVisible: true });
    }
  };

  handleStatusUpdate = playbackStatus => {

  }

  pressFullScreen = async() => {
    if(Platform.OS !== 'ios') {await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT)};
    this.vid.presentFullscreenPlayer();
    // this.setState({videoHeight: '100%', videoWidth: '100%'})
  }

  pressPlay = async() => {
    if (this.state.mediaState === 'PAUSED') {
      this.vid.playAsync();
      this.setState({ mediaState: 'PLAYING', playButtonImg: btnPause });
      this.hideControls();
      
    } else {
      this.vid.pauseAsync();
      this.setState({ mediaState: 'PAUSED', playButtonImg: btnPlay });
    }
  };

  videoPressed = () => {
    if (this.state.controlsVisible === false) {
      this.setState({ controlsVisible: true });
      this.hideControls();
    }
  };

  hideControls = () => {
    setTimeout(() => {
      //Put All Your Code Here, Which You Want To Execute After Some Delay Time.
      if (this.state.mediaState === 'PLAYING') {
        this.setState({ controlsVisible: false });
      }
    }, 3000);
  }

    handleBack() {
    this.props.navigation.goBack();
  }

  handleHeartClick = async () => {
    let { isFav } = this.state
    let category = this.props.navigation.getParam('category')
    let key = this.props.navigation.getParam('key')
    if (isFav) {
      this.setState({ isFav: false })
      await removeFav(key)
    } else {
      this.setState({ isFav: true })
      await addFav(key, 'audio', category)
    }
  }

  async checkIfDownload() {
    let isDownload = await checkDownload(this.props.navigation.getParam('key'))
    this.setState({ isDownload })
  }  

  handleDownloadClick = async () => {
    const {isDownload} = this.state
    const key = this.props.navigation.getParam('key')
    const assetData = {
      cat: this.props.navigation.getParam('category'),
      type: 'video'
    }
    this.setState({downloading: true})
    if (!isDownload) {
      await saveDownloadData(key, assetData)
      const downloadImages = await storeOfflineImages(key)
      const download = await storeOfflineAsset(key, 'video')
      if(download.status == 200){
        this.setState({ isDownload: true })
        this.refs.toast.show(translate("Audios.downloadsadded"), 1000);
      } else {
        this.alertErrorDownloading()
      }
    } else {
        await removeDownload(key)
        await deleteOfflineAsset(key, 'video')
        this.setState({ isDownload: false })
        this.refs.toast.show(translate("Audios.downloadsremoved"), 1000);
    }
    await getDownloadsContent()
    this.setState({ downloading: false })
  }

  alertErrorDownloading = () => {
    const title = "Download not completed";
    const message = 'Try again later';
    Alert.alert(title, message);
  };  

  render() {
    const {connected} = this.state
    const key = this.props.navigation.getParam('key');
    const urlimg = 'https://tlexeurope.s3.eu-central-1.amazonaws.com/videos/';
    let onlineDir = urlimg + this.props.navigation.getParam('key') + '.mp4';
    const localDir = getOfflineRoute(key, 'video')
    const videoSource = connected ? { uri: onlineDir } : localDir;

    return (
      <BaseContainer title={this.props.navigation.state.params.title} navigation={this.props.navigation} scrollable backBtn>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <Toast
          ref='toast'
          style={{ backgroundColor: COLORS.orange }}
          position="top"
          positionValue={WindowDimensions.height / 3}
          fadeInDuration={1000}
          fadeOutDuration={3000}
          opacity={0.9}
        />         
        <BackArrow handleBackPress={() => this.handleBack()} />
        <View style={styles.container}>
          <TouchableHighlight onPress={() => this.videoPressed()}>
            <Video
              resizeMode={Video.RESIZE_MODE_COVER}
              onLoad={this.handleOnLoad}
              onFullscreenUpdate={this.handleFullscreenUpdate}
              onEnd={this.handleEnd}
              onPlaybackStatusUpdate={this.handleStatusUpdate}
              ref={r => (this.vid = r)}
              source={videoSource}
              rate={1.0}
              volume={1.0}
              muted={false}
              usePoster
              posterSource={{ uri: this.props.navigation.state.params.photo }}
              posterStyle={{resizeMode: 'cover',  backgroundColor: COLORS.lightgray}}
              style={{
                width: this.state.videoWidth,
                height: this.state.videoHeight,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          </TouchableHighlight>
          {this.state.controlsVisible ? (
            <View style={styles.indicator}>
              <TouchableOpacity onPress={this.pressPlay}>
                <Image style={styles.button} source={this.state.playButtonImg} />
              </TouchableOpacity>
            </View>
          ) : null}
          {this.state.controlsVisible ? (
            <View style={styles.fullbutton}>
              <TouchableOpacity >
                <Icon name={'ios-expand'} onPress={this.pressFullScreen} />
              </TouchableOpacity>
            </View>
          ) : null}
          {this.state.mediaState === 'LOADING' ? (
            <View style={styles.indicator}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : null}
        </View>
         <ScrollView style={{ marginTop: 12, marginBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
          <View style={style.section}>
            <Icon name={'ios-film'} style={{color: COLORS.orange}} /><Text style={{ paddingLeft: 20, flexWrap: 'wrap', flex: 1, color: COLORS.gray}}><Text style={{ fontWeight: "bold" }}></Text> {this.props.navigation.state.params.title}</Text>
          </View>
          <View style={style.section}>
            <Icon name={'ios-code-working'} style={{color: COLORS.orange}} /><Text style={{ paddingLeft: 20, flexWrap: 'wrap', flex: 1, color: COLORS.gray}}><Text style={{ fontWeight: "bold" }}></Text>{this.props.navigation.state.params.Description}</Text>
          </View>
          <View style={style.section}>
            <Icon name={'ios-timer'} style={{color: COLORS.orange}} /><Text style={{ paddingLeft: 20, color: COLORS.gray}}><Text style={{ fontWeight: "bold" }}> </Text> {this.props.navigation.state.params.duration}</Text>
          </View>
          <View style={style.section}>
            <Icon name={'ios-person'} style={{color: COLORS.orange}} /><Text style={{ paddingLeft: 20, color: COLORS.gray}}><Text style={{ fontWeight: "bold" }}></Text> {this.props.navigation.state.params.trainer}</Text>
          </View>
          {connected && ( 
          <TouchableOpacity onPress={this.handleDownloadClick}>
            <View style={style.section}>
                {!this.state.downloading ? <Icon name={'ios-cloud-download'} style={{color: this.state.isDownload ? COLORS.orange : COLORS.gray}} /> : <ActivityIndicator color={COLORS.orange} size='small'/> }<Text style={{ paddingLeft: 20, color: COLORS.gray}}><Text style={{ fontWeight: "bold" }}> </Text>Download</Text>
            </View>
          </TouchableOpacity>
          )}
        </ScrollView>
      </BaseContainer>
    );
  }
}

const videoDisplayWidth = Dimensions.get('window').width;
const videoDisplayHeight = videoDisplayWidth * 0.55;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  button: {
    width: 60,
    height: 60
  },
  fileName: {
    color: '#FFFF87',
    fontWeight: '400',
    fontSize: 18,
    textAlign: 'center'
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: "center",
    alignItems: 'center'
  },
  fullbutton: {
    position: "absolute",
    right: 10,
    bottom: 10
  }
});

const { width } = Dimensions.get('window');
const height = width * 0.8

const style = StyleSheet.create({
  img: {
    width,
    height: width * (500 / 750),
    resizeMode: "cover"
  },
  row: {
    justifyContent: "center",
    alignItems: "center",
    padding: variables.contentPadding * 1
  },
   section: {
    paddingBottom: 23,
    paddingTop: 23,
    borderBottomWidth: variables.borderWidth,
    borderColor: COLORS.lightgray,
    flexDirection: "row",
    alignItems: "center"
  }
});