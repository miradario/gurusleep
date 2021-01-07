// @flow
import moment from "moment";
import * as React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator, Alert,  ScrollView, Switch , Linking, Share } from "react-native";
import { H1, H3, Button, Text, Icon } from "native-base";
import { BaseContainer, Images, Styles, BackArrow, CachedImage} from "../components";
import { checkFav, checkDownload, addFav, removeFav, removeDownload, saveDownloadData, getDownloadsContent} from "../../modules/firebaseAPI";
import {storeOfflineAsset, deleteOfflineAsset, storeOfflineImages} from "../../modules/localStorageAPI"
import type { ScreenProps } from "../components/Types";
import WindowDimensions from "../components/WindowDimensions";
import { Ionicons } from '@expo/vector-icons';
import { Constants } from 'expo'; 
import { Audio } from 'expo-av';
import variables from "../../native-base-theme/variables/commonColor";
import COLORS from "../assets/Colors";
import ButtonGD from "../components/ButtonGD";
import translate from '../../utils/language';
import * as Matomo from "react-native-matomo";
import * as commonFunctions from '../../utils/common.js';
import { checkInternetConnection } from 'react-native-offline';
import Toast, { DURATION } from "react-native-easy-toast";
import dynamicLinks from '@react-native-firebase/dynamic-links';

const btnPlay = Images.play_btn;

const dymaniclink='https://tlexinstitute.page.link/?link=https://www.tlexinstitute.com/app?meditation%3D'

const deeplink='&apn=com.tlexinsitute.tlexmindfullness&ibi=com.tlexinstitute.tlexmindfullness'

export default class AudiosPlayer extends React.PureComponent<ScreenProps<>> {

  constructor(props){
    super(props)
    this.state = {
      playingStatus: "LOADING",
      playButtonImg: btnPlay,
      controlsVisible: false,
      isFav: false,
      isDownload: false,
      downloading: false,
      muschange: false,
      music:false,
      mus_color: "",
      startTime: 0,
      endTime: 0,
      elapsed: 0,
      elapsedMinutes: 0,
      connected: true
    }
  }

  start() {
    this.setState({ startTime: new Date() });
  }

  end() {
    let endTime = new Date();
    let timeDiff = endTime - this.state.startTime; //in ms
    // strip the ms
    timeDiff /= 1000;
    // get seconds 
    let seconds = Math.round(timeDiff);
    this.setState({ elapsed: seconds })
  }

  async checkIfFav() {
    let isFav = await checkFav(this.props.navigation.getParam('key'))
    this.setState({ isFav: isFav })
  }

  async checkIfDownload() {
    let isDownload = await checkDownload(this.props.navigation.getParam('key'))
    this.setState({ isDownload })
  }

  async componentDidMount() {
    const { navigation } = this.props;
    const key = navigation.getParam('key');
    commonFunctions.matomoTrack('screen', 'audioMenu');
    const connected = await checkInternetConnection();
    if (connected){
      await this.checkIfFav(key)
      await this.checkIfDownload(key)
    }
    this.setState({connected})

    this.focusListener = this.props.navigation.addListener(
      "didFocus",
      () => {
         console.log(this.state.downloading)
      }
    );    
  }

  StartMeditation(navigation) {
    this.state.title = this.props.navigation.state.params.title,
    this.state.key = this.props.navigation.getParam('key'),
    this.state.photo = this.props.navigation.getParam('photo')
    this.state.duration = this.props.navigation.getParam('duration')
   
    
    navigation.navigate("AudiosPlayer",
      {
        ptitle: this.state.title,
        key: this.state.key,
        category : this.props.navigation.getParam('category') ,
        checkbkgmusic :  this.props.navigation.getParam('music'),
        //url: this.state.url,
        photo: this.state.photo,
        duration: this.state.duration,
        music: this.state.muschange,
      }
    );
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

  handleDownloadClick = async () => {
    const {isDownload} = this.state
    const key = this.props.navigation.getParam('key')
    const assetData = {
      cat: this.props.navigation.getParam('category'),
      path: 'local_path',
      type: 'audio'
    }
    this.setState({downloading: true})
    if (!isDownload) {
      await saveDownloadData(key, assetData)
      const downloadImages = await storeOfflineImages(key)
      const download = await storeOfflineAsset(key, 'audio')
      if(download.status == 200){
        this.setState({ isDownload: true, downloading: false })
        this.refs.toast.show(translate("Audios.downloadsadded"), 1000);
      } else {
        this.alertErrorDownloading()
        this.setState({downloading: false})
      }
    } else {
      await removeDownload(key)
      await deleteOfflineAsset(key, 'audio')
      this.setState({ isDownload: false })
      this.refs.toast.show(translate("Audios.downloadsremoved"), 1000);
      this.setState({downloading: false})
    }
    await getDownloadsContent()
  }

  alertErrorDownloading = () => {
    const title = "Download not completed";
    const message = 'Try again later';
    Alert.alert(title, message);
  };

  handlePlay() {
    this.StartMeditation(this.props.navigation)
  }

  handleBack() {
    this.props.navigation.goBack();
    console.log(this.state.downloading)
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }


  Musicchange() {
    this.setState({ muschange: !this.state.muschange });
    if (this.state.muschange) {
      this.setState({ mus_color: COLORS.orange });
    } else {
      this.setState({ mus_color: COLORS.lightgray});
    }
    
  }

generateLink = async (key) => { 
   const { navigation } = this.props;
  const cat = '&category=' + navigation.getParam('category') ;

   const link = await dynamicLinks().buildShortLink({
   //link: 'https://tlexflow.app?meditation%3D' + key + cat,
    link: 'https://tlexflow.app?meditation=' + key + cat,
   domainUriPrefix: 'https://tlexinstitute.page.link',
   android: {
   	packageName: 'com.tlexinsitute.tlexmindfullness',
   },
   ios: {
   	bundleId: 'com.tlexinstitute.tlexmindfullness'
   }
 }, dynamicLinks.ShortLinkType.SHORT);

return link;
}


 onShare = async () => {
    const { navigation } = this.props;

    let key = navigation.getParam('key')
    const cat = '%26category%3D' + navigation.getParam('category') ;

    let link = await this.generateLink(key); 
    console.log ("link" + link);
    
    
      navigation.getParam('key')
      const result = await Share.share({
       title: 'Tlex Flow',
  message:  translate("Audios.found") + ' "' + navigation.getParam('title', '') + '", ' + link
      });
 }

  render(): React.Node {
    const { navigation } = this.props;
    const url = navigation.getParam('url', 'some default value');
    const photo = navigation.getParam('photo', '');
    const title = navigation.getParam('title', '');
    const music =  navigation.getParam('music', false);
    const id =  navigation.getParam('key', false);
    const today = moment();
    const date = today.format("MMMM D");
    const { isFav, connected } = this.state

    let heartColor = COLORS.lightgray
    if (isFav) { heartColor = COLORS.orange }

    Images.yoga = photo;
  

    return (
      <BaseContainer title="" navigation={this.props.navigation} backBtn>
        <BackArrow handleBackPress={() => this.handleBack()} />
        <View style={style.container}>
        <Toast
          ref='toast'
          style={{ backgroundColor: COLORS.orange }}
          position="top"
          positionValue={WindowDimensions.height / 3}
          fadeInDuration={1000}
          fadeOutDuration={3000}
          opacity={0.9}
        />          
          {connected && (  
            <TouchableOpacity style={style.btnFavWrapper} onPress={this.handleHeartClick}>
              <View style={{ height: 35, width: 35, borderRadius: 50, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', paddingTop: 5 }}>
                <Ionicons name={'ios-heart'} color={heartColor} size={25} />
              </View>
            </TouchableOpacity>
            )}
          {connected && (            
            <TouchableOpacity style={style.btnShareWrapper} onPress={() => this.onShare()}>
              <View style={{ height: 35, width: 35, borderRadius: 50, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', paddingTop: 1 }}>
                <Ionicons name={'ios-share'} color={COLORS.blue} size={30} />
              </View>
            </TouchableOpacity>
          )}
          {connected && (
          <DownloadButton handleClick={this.handleDownloadClick} downloadEnabled = {!this.state.isDownload} downloading={this.state.downloading}/>
          )}
          <View style={style.img}>
            <Text style={style.audioTitle}>{this.capitalize(this.props.navigation.state.params.title)}</Text>
            <View style={style.playButtonWrapper}>
              <TouchableOpacity onPress={() => this.handlePlay()}>
                <View style={style.playButton}>
                  <Image style={style.playButtonImg} source={btnPlay} />
                </View>
              </TouchableOpacity>
            </View>
            <CachedImage source={{ uri: photo }} resizeMode="cover" style={[StyleSheet.absoluteFill, style.img, { backgroundColor: COLORS.gray }]} title={`${id}_cover`}/>
          </View>
          {/* {this.state.controlsVisible ? (
            <View style={style.indicator}>
              <TouchableOpacity onPress={this._playAndPause}>
                <Image style={style.button} source={this.state.playButtonImg} />
              </TouchableOpacity>
            </View>
          ) : null}
          {this.state.playingStatus === 'LOADING' ? (
            <View style={style.indicator}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : null} */}
        </View>
        {/* <View style={style.section}>
          <Icon name={'ios-bookmark'} /><Text style={{ paddingLeft: 20 }}><Text style={{ fontWeight: "bold" }}> Title:</Text> {this.props.navigation.state.params.title}</Text>
        </View> */}

        <ScrollView style={{ marginTop: 12, marginBottom: 10, paddingLeft: 20, paddingRight: 20 }}>
         {music=="yes" && (
          <View style={style.section}>
            <Switch
                      value={this.state.muschange}
                      onValueChange={v => { this.Musicchange() }}
                      trackColor={{ false: COLORS.lightgray, true: COLORS.orange }}
                    />
                    <Text style={{ paddingLeft: 10, flexWrap: 'wrap', flex: 1, color: COLORS.gray }}><Text style={{ fontWeight: "bold" }}></Text> {translate("Audios.background")}</Text>
          </View>
         )}
          <View style={style.section}>
            <Icon name={'ios-code-working'} style={{ color: COLORS.orange }} /><Text style={{ paddingLeft: 32, flexWrap: 'wrap', flex: 1, color: COLORS.gray }}><Text style={{ fontWeight: "bold" }}></Text>{this.props.navigation.state.params.Description}</Text>
          </View>
          <View style={style.section}>
            <Icon name={'ios-timer'} style={{ color: COLORS.orange }} /><Text style={{ paddingLeft: 32, color: COLORS.gray }}><Text style={{ fontWeight: "bold" }}> </Text> {this.props.navigation.state.params.duration}</Text>
          </View>
          <View style={style.section}>
            <Icon name={'ios-person'} style={{ color: COLORS.orange }} /><Text style={{ paddingLeft: 32, color: COLORS.gray }}><Text style={{ fontWeight: "bold" }}></Text> {this.props.navigation.state.params.trainer}</Text>
          </View>
   
        </ScrollView>
         
    

      </BaseContainer>
    );
  }
}

const DownloadButton = props => (
  <TouchableOpacity style={style.btnDownloadWrapper} onPress={props.handleClick} enabled={!props.downloading} activeOpacity={props.downloading ? 1 : 0.5}>
    <View style={{ height: 35, width: 35, borderRadius: 50, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' }}>
    {!props.downloading ? (
      <Ionicons name={'ios-cloud-download'} color={props.downloadEnabled ? COLORS.gray : COLORS.orange} size={28} />
      ) : (
      <ActivityIndicator color={COLORS.orange} size="small"/>
    )}
    </View>
  </TouchableOpacity>
)

const { width } = Dimensions.get("window");
const style = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  audioTitle: {
    position: 'absolute',
    zIndex: 100,
    left: 0,
    right: 0,
    top: 80,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor:COLORS.blue,
    textShadowOffset:{width: 2, height: 2},
    textShadowRadius:10,
  },
  playButtonWrapper: {
    position: 'absolute',
    top: 185,
    left: 0,
    right: 0,
    zIndex: 100,
    alignItems: 'center'
  },
  playButton: {
    height: 82,
    width: 82,
    borderRadius: 90,
    borderColor: COLORS.white,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3
  },
  playButtonImg: {
    height: 37,
    width: 37
  },
  discardIcon: {
    paddingLeft: 35
  },
  discard: {
    flex: 1,
    position: 'absolute',
    paddingLeft: 5,
    left: 10,
    bottom: 10,
  },
  CompleteIcon: {
    paddingLeft: 40
  },
  Complete: {
    flex: 1,
    position: 'absolute',
    paddingRight: 5,
    right: 10,
    bottom: 10,
  },
  img: {
    width,
    height: width
  },
  btnFavWrapper: {
    position: 'absolute',
    zIndex: 1000,
    top: 15,
    right: 5
  },
   btnShareWrapper: {
    position: 'absolute',
    zIndex: 1000,
    bottom: 15,
    left: 10 
  },
  btnDownloadWrapper: {
    position: 'absolute',
    zIndex: 1000,
    bottom: 15,
    right: 5
  },  
  row: {
    justifyContent: "center",
    alignItems: "center",
    padding: variables.contentPadding * 2
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
  button: {
    width: 60,
    height: 60
  },
  section: {
    paddingBottom: 10,
    paddingTop: 10,
    borderBottomWidth: variables.borderWidth,
    borderColor: COLORS.lightgray,
    flexDirection: "row",
    alignItems: "center"
  },
   share: {
    paddingBottom: 10,
    paddingTop: 10,
    borderBottomWidth: variables.borderWidth,
    borderColor: COLORS.lightgray,
    flexDirection: "row",
    alignItems: "center",
    padding: 100,
  }
});

// https://github.com/expo/expo/issues/1141