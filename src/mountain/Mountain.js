// @flow
import * as React from "react";
import { Image as Img, View, ScrollView, StyleSheet, Dimensions, Button, TouchableOpacity, Alert, Text, ActivityIndicator, StatusBar, Animated, TouchableHighlight } from "react-native";
import { BaseContainer, TaskOverview, Images, Styles, WindowDimensions, BackArrow } from "../components";
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Ionicons } from 'react-native-vector-icons';
import Svg, { Circle, G, Path, Image } from 'react-native-svg';
import type { ScreenProps } from "../components/Types";
import { AnimatedView } from "../components/Animations";
import { getChallenge, getPhrases, checkDay, unCheckDay } from "../../modules/firebaseAPI";
import { current_day, finished, abandoned } from "../../modules/challengesAPI";
import { whileStatement } from "@babel/types";
import Toast, { DURATION } from 'react-native-easy-toast'
import COLORS from "../assets/Colors";
import { Row } from "native-base";
import { Audio, Video } from 'expo-av';
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import translate from '../../utils/language';
const width = WindowDimensions.height / 1334 * 750
const height = WindowDimensions.height

const videos = {
  lake: require("../../assets/videos/bg_lake.mp4"),
  summer: require("../../assets/videos/bg_summer.mp4"),
  winter: require("../../assets/videos/bg_winter.mp4"),
}

const mountain = {
  lake: require("../../assets/images/mountain-lake.jpg"),
  summer: require("../../assets/images/mountain-summer.jpg"),
  winter: require("../../assets/images/mountain-winter.jpg"),
}
console.log(Images.mountain_lakemp3);
const mountains_audio = {
  lake: require("../../assets/audio/lake.mp3"),
  summer: require("../../assets/audio/summer.mp3"),
  winter: require("../../assets/audio/winter.mp3"),
}

const mountains_points = {
  lake: [
    { x: 0.82 * width, y: 0.77 * height },
    { x: 0.70 * width, y: 0.75 * height },
    { x: 0.62 * width, y: 0.73 * height },
    { x: 0.53 * width, y: 0.71 * height },
    { x: 0.42 * width, y: 0.58 * height },
    { x: 0.30 * width, y: 0.57 * height },
    { x: 0.20 * width, y: 0.55 * height },
    { x: 0.10 * width, y: 0.54 * height },
    { x: 0.28 * width, y: 0.45 * height },
    { x: 0.42 * width, y: 0.46 * height },
    { x: 0.38 * width, y: 0.38 * height },
    { x: 0.38 * width, y: 0.32 * height },
    { x: 0.35 * width, y: 0.27 * height },
    { x: 0.50 * width, y: 0.25 * height },
    { x: 0.65 * width, y: 0.25 * height },
    { x: 0.80 * width, y: 0.25 * height },
    { x: 0.68 * width, y: 0.20 * height },
    { x: 0.58 * width, y: 0.18 * height },
    { x: 0.48 * width, y: 0.17 * height },
    { x: 0.54 * width, y: 0.12 * height },
  ],
  summer: [
    { x: 0.38 * width, y: 0.80 * height },
    { x: 0.50 * width, y: 0.82 * height },
    { x: 0.60 * width, y: 0.80 * height },
    { x: 0.70 * width, y: 0.75 * height },
    { x: 0.75 * width, y: 0.69 * height },
    { x: 0.84 * width, y: 0.66 * height },
    { x: 0.76 * width, y: 0.64 * height },
    { x: 0.65 * width, y: 0.62 * height },
    { x: 0.54 * width, y: 0.6 * height },
    { x: 0.42 * width, y: 0.58 * height },
    { x: 0.30 * width, y: 0.56 * height },
    { x: 0.19 * width, y: 0.53 * height },
    { x: 0.34 * width, y: 0.50 * height },
    { x: 0.47 * width, y: 0.48 * height },
    { x: 0.59 * width, y: 0.45 * height },
    { x: 0.50 * width, y: 0.42 * height },
    { x: 0.36 * width, y: 0.40 * height },
    { x: 0.47 * width, y: 0.35 * height },
    { x: 0.49 * width, y: 0.29 * height },
    { x: 0.42 * width, y: 0.24 * height },
  ],
  winter: [
    { x: 0.22 * width, y: 0.77 * height },
    { x: 0.35 * width, y: 0.75 * height },
    { x: 0.47 * width, y: 0.73 * height },
    { x: 0.60 * width, y: 0.71 * height },
    { x: 0.72 * width, y: 0.69 * height },
    { x: 0.84 * width, y: 0.66 * height },
    { x: 0.76 * width, y: 0.64 * height },
    { x: 0.65 * width, y: 0.62 * height },
    { x: 0.54 * width, y: 0.6 * height },
    { x: 0.42 * width, y: 0.58 * height },
    { x: 0.30 * width, y: 0.56 * height },
    { x: 0.19 * width, y: 0.53 * height },
    { x: 0.34 * width, y: 0.50 * height },
    { x: 0.47 * width, y: 0.48 * height },
    { x: 0.59 * width, y: 0.45 * height },
    { x: 0.48 * width, y: 0.42 * height },
    { x: 0.36 * width, y: 0.40 * height },
    { x: 0.47 * width, y: 0.35 * height },
    { x: 0.50 * width, y: 0.31 * height },
    { x: 0.48 * width, y: 0.27 * height },
  ],
}

const obj1 = {
  challenge1: require("../assets/challenges/challenge-1.png"),
  challenge2: require("../assets/challenges/challenge-2.png"),
  challenge3: require("../assets/challenges/challenge-3.png"),
  challenge4: require("../assets/challenges/challenge-4.png"),
  challenge5: require("../assets/challenges/challenge-5.png"),
  challenge6: require("../assets/challenges/challenge-6.png"),
  challenge7: require("../assets/challenges/challenge-7.png"),
  challenge8: require("../assets/challenges/challenge-8.png"),
  challenge9: require("../assets/challenges/challenge-9.png"),
  challenge10: require("../assets/challenges/challenge-10.png"),
  challenge11: require("../assets/challenges/challenge-11.png"),
  challenge12: require("../assets/challenges/challenge-12.png"),
  challenge13: require("../assets/challenges/challenge-13.png"),
  challenge14: require("../assets/challenges/challenge-14.png"),
  challenge15: require("../assets/challenges/challenge-15.png"),
  challenge16: require("../assets/challenges/challenge-16.png"),
  challenge17: require("../assets/challenges/challenge-17.png"),
  challenge18: require("../assets/challenges/challenge-18.png"),
  challenge10: require("../assets/challenges/challenge-10.png"),
  challenge11: require("../assets/challenges/challenge-11.png"),
  challenge12: require("../assets/challenges/challenge-12.png"),
  challenge13: require("../assets/challenges/challenge-13.png"),
  challenge14: require("../assets/challenges/challenge-14.png"),
  challenge15: require("../assets/challenges/challenge-15.png"),
  challenge16: require("../assets/challenges/challenge-16.png"),
  challenge17: require("../assets/challenges/challenge-17.png"),
  challenge18: require("../assets/challenges/challenge-18.png")
};

export default class Mountain extends React.PureComponent<ScreenProps<>> {

  constructor(props) {
    super(props);
    const { params } = this.props.navigation.state
    this.cloudPosition = new Animated.Value(-200)
    this.state = {
      challengeData: {},
      dayPhrases: {},
      pointStatus: [],
      loading: true,
      activePoint: 0,
      activePointStatus: '',
      finished,
      completed: '',
      abandoned: '',
      left: '',
      current: '',
      currentDay: 0,
      dayStarted: '',
      challengeWhat: '',
      challengeWhy: '',
      challengeHow: '',
      challengeProblems: '',
      challengeImage: '',
      mountainType: 'lake',
      showPhrase: false,
      showPhraseChecked: false,
      phraseLoading: false,
      phraseX: 0,
      phraseY: 0,
      phraseHeight: 100,
      phraseColor: '',
      phraseCaption: '',
      currentPhrase: '',
      btnColor: '',
      phraseText: '',
      challengeKey: params.pkey,
      refreshPoints: false,
      showInfo: false,
      index: 0,
      cloudTop: 160,
      mefui: false,

    }
  }

  _playRecording = async (mountain) => {
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(mountains_audio[mountain]);
      this.audioPlayer1 = soundObject;
       console.log ("entre a ejecutarlo pero ");
      if(this._ismounted ) {
         
        this.audioPlayer1.playAsync();
        this.audioPlayer1.setIsLoopingAsync(true);
        this.audioPlayer1.setVolumeAsync(0.3);
        this.audioPlayer1.setPositionAsync(0);
        if ( this.state.mefui ==true){
            this.audioPlayer1.stopAsync();
           
        }
      
      }
      //this.audioPlayer1.setRateAsync(3, false);
    } catch (error) {
      // An error occurred!
    }
  }

  async componentWillUnmount() {
    const { playbackInstance } = this.state;
    this._ismounted = false;
    await this.audioPlayer1.pauseAsync();
  }

  componentDidMount() {
    this.watchAuthState(this.removeCover);
  }

   async componentWillUnmount() {
    this._ismounted  = false;
     console.log ('unmount');
       
    if(this.audioPlayer1 !== undefined){
       
      
    
      await this.audioPlayer1.stopAsync();
    }
  }

  componentDidMount() {
    this._ismounted = true;
    if (this.props.navigation.getParam('mountain', 'summer') != 'lake') { this.animateCloud() };
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
        this.state.mefui =false;
        this.setChallengeData(this.state.challengeKey)
        this.setPhrases()
        });
     this.blurListener = this.props.navigation.addListener("willBlur", () => {
     
       this.state.mefui=true;
       
      if(this.audioPlayer1 !== undefined){
        this.audioPlayer1.stopAsync();
      }
    })
  }

  async setChallengeData(challengeKey) {
    const dataObj = await getChallenge(challengeKey)
    let dayStarted = dataObj.daystart
    let currentDay = current_day(dayStarted)
    let isFinished = finished(currentDay)
    let completed = dataObj.completed
    let dayChecked = dataObj['day' + currentDay]
    let daysRemaining = 21 - currentDay
    this.setState({
      loading: false,
      challengeData: dataObj,
      challengeTitle: dataObj.title,
      challengeWhat: dataObj.what,
      challengeWhy: dataObj.why,
      challengeHow: dataObj.how,
      challengeImage: dataObj.image,
      challengeProblems: dataObj.problems,
      mountainType: dataObj.mountain,
      currentDay: currentDay,
      pointStatus: this.getPointsStatus(dataObj, currentDay),
      completed: completed,
      abandoned: abandoned(isFinished, dayChecked, completed, currentDay),
      dayStarted: dayStarted,
      daysRemaining: daysRemaining
    })
    this._playRecording(this.state.mountainType);
  }

  async setPhrases() {
    const dayPhrases = await getPhrases()
    this.setState({ dayPhrases: dayPhrases })
  }

  onPhraseLayout(event) {
    this.setState({ phraseHeight: event.nativeEvent.layout.height + 40 })
  }

  async animateCloud(time) {
    let wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    await (wait(time));
    this.cloudPosition.setValue(-200);
    Animated.timing(
      this.cloudPosition,
      {
        toValue: WindowDimensions.width + 200,
        duration: 30000,
      }
    ).start(() => {
      let cloudTop = Math.floor(Math.random() * 110) + 200;
      let holdTime = Math.floor(Math.random() * 2000) + 4000;
      this.setState({ cloudTop: cloudTop });
      this.animateCloud(holdTime);
    });
  }

  getPointsStatus(data, currentDay) {
    let status = []
    for (let i = 0; i < 21; i++) {
      let dayNum = i + 1
      if (dayNum > currentDay) {
        status[i] = 'pending'
      } else {
        status[i] = (data['day' + dayNum] == 1) ? 'checked' : 'failed'
      }
    }
    return status
  }

  changePoint(pointNum, status) {
    let pointStatus = this.state.pointStatus
    pointStatus[pointNum - 1] = status
    this.setState({ pointStatus: pointStatus })
    this.refreshPointColor();
  }

  refreshPointColor = () => {
    this.setState({ refreshPoints: !this.state.refreshPoints })
  }

  phraseClickHandler = () => {
    let status = this.state.activePointStatus
    let activeDay = this.state.activePoint
    let challengeKey = this.state.challengeKey
    switch (status) {
      case 'failed':
        this.checkActiveDay(activeDay, challengeKey)
        break;
      case 'checked':
        this.unCheckActiveDay(activeDay, challengeKey)
        break;
      case 'pending':
        break;
    }
  }

  phraseCheckClickHandler = () => {
    this.setState({ showPhraseChecked: false })
  }

  async checkActiveDay(activeDay, challengeKey) {
    this.setState({ phraseLoading: true })
    let updateResult = await checkDay(challengeKey, activeDay)
    let dayNum = activeDay
    let currentPhrase = this.state.dayPhrases['day' + dayNum]
    this.setState({ activePointStatus: 'checked', phraseLoading: false, currentPhrase: currentPhrase, showPhrase: false, showPhraseChecked: true })
    this.changePoint(activeDay, 'checked')
  }

  async unCheckActiveDay(activeDay, challengeKey) {
    this.setState({ phraseLoading: true })
    let updateResult = await unCheckDay(challengeKey, activeDay)
    this.setState({ activePointStatus: 'unchecked', phraseLoading: false, showPhrase: false })
    this.changePoint(activeDay, 'failed')
    this.refs.toast.show(translate("Mountain.checked"))
  }

  pointClickHandler = (pointData) => {
    let pointStatus = pointData.status
    let dayNum = pointData.index + 1
    if (dayNum <= this.state.currentDay) {
      let phraseColor = '#f17023', btnColor = '#03a5c7', phraseCaption = translate("Mountain.check_day")
      let currentPhrase = translate("Mountain.missed")
      if (pointStatus == 'checked') {
        phraseColor = '#03a5c7'
        btnColor = '#f17023'
        phraseCaption = 'Uncheck'
        currentPhrase = this.state.dayPhrases['day' + dayNum]
      }
      this.setState({ showPhrase: true, phraseText: pointData.phrase, phraseColor: phraseColor, btnColor: btnColor, phraseCaption: phraseCaption, currentPhrase: currentPhrase, activePoint: dayNum, activePointStatus: pointStatus })
      this.setPhrasePosition(pointData.x, pointData.y)
    }
  }

  renderPhrase = (x, y, phrase, color, btnColor, phraseCaption) => {
    if (this.state.showPhrase) {
      return (
        <AnimatedView style={[style.phraseBox, Styles.shadow, { left: x, top: y, backgroundColor: COLORS.white }]}>
          <View style={{ flex: 1 }} onLayout={(event) => { this.onPhraseLayout(event) }}>
            <View style={{ flexGrow: 1 }}>
              <Text style={style.phraseText}>{phrase}</Text>
            </View>
            <View>
              <PhraseBtn caption={phraseCaption} btnColor={btnColor} loading={this.state.phraseLoading} onBtnClick={this.phraseClickHandler} />
            </View>
          </View>
        </AnimatedView>
      );
    } else {
      return null;
    }
  }

  renderPhraseChecked = (phrase) => {
    if (this.state.showPhraseChecked) {
      return (
        <AnimatedView style={[style.phraseCheckedBox, Styles.shadow]}>
          <View style={{ flex: 1 }}>
            <View style={{ flexGrow: 1 }}>
              <Text style={style.phraseText}>{phrase}</Text>
            </View>
            <View>
              <PhraseBtn caption={'Close'} btnColor={COLORS.orange} loading={this.state.phraseLoading} onBtnClick={this.phraseCheckClickHandler} />
            </View>
          </View>
        </AnimatedView>
      );
    } else {
      return null;
    }
  }

  btnInfoHandler = () => {
    this.setState({ showInfo: true, showPhrase: false, showPhraseChecked: false })
  }

  btnCloseInfoHandler = () => {
    this.setState({ showInfo: false })
  }

  btnEditHandler = () => {
    this.props.navigation.navigate("Create", {
      pkey: this.state.challengeKey,
      ptitle: this.state.challengeTitle,
      image: this.state.challengeImage
    });
  }

  setPhrasePosition = (x, y) => {
    let px = x
    if (x < WindowDimensions.width / 2) {
      px = (x < 90) ? 0 : x - 90
    } else {
      px = (x + 90 < WindowDimensions.width) ? x - 130 : x - 220
    }
    let py = y;
    this.setState({ phraseX: px, phraseY: py })
  }

  clickOut = () => {
    this.setState({ showPhrase: false, showPhraseChecked: false })
  }

  handleBack() {
    this.props.navigation.goBack();
  }

  next() {
    setTimeout(() => {
      this.setState({ index: (this.state.index + 1) % 8 });
      this.next();
    }, 120);
  }

  render(): React.Node {
    const { phraseX, phraseY, phraseHeight, phraseColor, btnColor, currentDay, currentPhrase, dayStarted, challengeHow, challengeTitle, challengeWhat, challengeProblems, refreshPoints, phraseCaption, challengeImage } = this.state
    const mountainType = this.props.navigation.getParam('mountain', 'summer')
    let posY = Math.max(phraseY - phraseHeight, 0);
    let image = challengeImage.replace("-", "");
    let imagesrc = obj1[image];


    /*   const points = [
        { x: 0.22 * width, y: 0.77 * height },
        { x: 0.35 * width, y: 0.75 * height },
        { x: 0.47 * width, y: 0.73 * height },
        { x: 0.60 * width, y: 0.71 * height },
        { x: 0.72 * width, y: 0.69 * height },
        { x: 0.84 * width, y: 0.66 * height },
        { x: 0.76 * width, y: 0.64 * height },
        { x: 0.65 * width, y: 0.62 * height },
        { x: 0.54 * width, y: 0.6 * height },
        { x: 0.42 * width, y: 0.58 * height },
        { x: 0.30 * width, y: 0.56 * height },
        { x: 0.19 * width, y: 0.53 * height },
        { x: 0.34 * width, y: 0.50 * height },
        { x: 0.47 * width, y: 0.48 * height },
        { x: 0.59 * width, y: 0.45 * height },
        { x: 0.48 * width, y: 0.42 * height },
        { x: 0.36 * width, y: 0.40 * height },
        { x: 0.47 * width, y: 0.35 * height },
        { x: 0.49 * width, y: 0.29 * height },
        { x: 0.42 * width, y: 0.24 * height },
      ]; */

    const points = mountains_points[mountainType];

    let pathCoords = "M " + points[0].x + ' ' + points[0].y;
    for (let index = 1; index < points.length; index++) {
      pathCoords = pathCoords + ' L ' + points[index].x + ' ' + points[index].y;
    }

    return (
      <BaseContainer title='Mountain' navigation={this.props.navigation} backBtn>
        <StatusBar backgroundColor="#7ed1f6" barStyle="dark-content" />
        <BackArrow handleBackPress={() => this.handleBack()} />
        <TouchableOpacity style={[style.infoButton, { position: 'absolute', right: 20, top: 10, backgroundColor: COLORS.blue, zIndex: 5000 }]} onPress={() => { this.btnEditHandler() }}>
          <Text style={style.infoText}>{translate("Mountain.edit")}</Text>
          <Icon name="arrow-circle-right" size={22} style={style.infoIcon} />
        </TouchableOpacity>
        <Title challengeTitle={this.props.navigation.state.params.title} challengeWhy={this.props.navigation.state.params.why} btnHandler={this.btnInfoHandler} />
        <Animated.Image
          source={require("../../assets/images/cloud.png")}
          resizeMode="contain"
          style={{ position: 'absolute', left: this.cloudPosition, top: this.state.cloudTop, zIndex: 4000, width: 200, height: 83, opacity: 0.8 }}
        />
        <Video
          source={videos[mountainType]}
          style={[style.backgroundVideo, { width: WindowDimensions.height / 1334 * 750, height: WindowDimensions.height, alignSelf: 'center' }]}
          rate={1}
          shouldPlay={true}
          isLooping={true}
          volume={1}
          muted={true}
          resizeMode="contain"
        />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Svg class="ad-SVG" width={WindowDimensions.height / 1334 * 750} height={WindowDimensions.height} onPress={this.clickOut}>
            <Image
              resizeMode="contain"
              style={{ alignSelf: 'center' }}
              width={WindowDimensions.height / 1334 * 750}
              height={WindowDimensions.height}
              href={null}
            />
            <Path class="ad-Path"
              d={pathCoords}
              fill="none"
              stroke="white" />
            <G class="ad-Points">
              {
                points.map((point, i) => {
                  return <Point key={i} x={point.x} y={point.y} status={this.state.pointStatus[i]} onPointClick={this.pointClickHandler} index={i} refresh={refreshPoints} mountain={mountainType} />
                })
              }
            </G>
          </Svg>
          {this.renderPhrase(phraseX, posY, currentPhrase, phraseColor, btnColor, phraseCaption)}
          {this.renderPhraseChecked(currentPhrase)}
          <Toast ref="toast"
            style={{ backgroundColor: this.state.activePointStatus == 'checked' ? COLORS.blue : COLORS.orange }}
            position='top'
            positionValue={height * 0.3}
            fadeInDuration={1000}
            fadeOutDuration={3000}
            opacity={1} />
        </View>
        {this.state.showInfo && (
          <AnimatedView style={{
            height: 220, position: "absolute", bottom: 0, zIndex: 3500, left: 0, right: 0,
            borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: COLORS.white, padding: 15
          }}>
            <TouchableOpacity onPress={() => this.btnCloseInfoHandler()} style={{ position: 'absolute', right: 15, top: 10 }}>
              <Ionicons name="md-close-circle" size={30} style={{ color: COLORS.orange }} />
            </TouchableOpacity>
            {/* <View><Text style={style.infoTitle}>Challenge Info</Text></View> */}
            <View style={{ marginTop: 20, flexDirection: 'row' }}>
              <View style={{ flex: 2, justifyContent: 'center' }}>
                <Img
                  resizeMode='contain'
                  source={imagesrc}
                  style={{ tintColor: COLORS.orange, width: 50 }}
                />
              </View>
              <View style={{ flex: 7 }}>
                <ScrollView>
                  <DetailLine lineTitle={translate("Mountain.what")} iconName="calendar-alt" lineContent={challengeWhat} />
                  <DetailLine lineTitle={translate("Mountain.When")}  iconName="calendar-alt" lineContent={challengeHow} />
                  <DetailLine lineTitle={translate("Mountain.challenges")}  iconName="calendar-alt" lineContent={challengeProblems} />
                  <DetailLine lineTitle={translate("Mountain.start_date")} iconName="calendar-alt" lineContent={dayStarted} />
                </ScrollView>
              </View>
            </View>
          </AnimatedView>
        )}
      </BaseContainer>
    );
  }
}

class Point extends React.Component {

  constructor(props) {
    super(props);
  }

  onPressBtn = () => {
    this.setState({ showPhrase: true, selected: true })
    pointData = { x: this.props.x, y: this.props.y, index: this.props.index, status: this.props.status }
    this.props.onPointClick(pointData)
  }

  setColor(status) {
    let color = '';
    switch (status) {
      case 'failed':
        color = COLORS.orange
        break;
      case 'checked':
        color = COLORS.blue
        break;
      case 'pending':
        color = this.props.mountain === "winter" ? COLORS.black : COLORS.lightgray
        break;
      default:
        color = this.props.mountain === "winter" ? COLORS.black : COLORS.lightgray
    }
    return color;
  }

  render(): React.Node {
    const { status } = this.props;
    let pointStyle = this.setColor(status);
    return (
      <G>
        <Circle cx={this.props.x}
          cy={this.props.y}
          r="8"
          fill={pointStyle}
          stroke="white"
          onPress={this.onPressBtn}></Circle>
      </G>
    );
  }
}

class PhraseBtn extends React.Component {
  render() {
    if (this.props.loading == false) {
      return (
        <TouchableOpacity onPress={this.props.onBtnClick}>
          <View style={[style.phraseButton, { backgroundColor: this.props.btnColor }, Styles.shadow]}>
            <Text style={{ color: 'white' }}>{this.props.caption}</Text>
          </View>
        </TouchableOpacity>
      )
    } else {
      return (
        <ActivityIndicator size="small" color={COLORS.orange} />
      )
    }

  }
}

class Title extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { challengeTitle, challengeWhy, btnHandler } = this.props
    return (
      <View style={style.titleMainWrapper}>
        <View style={style.titleContainer}>
          <View style={{ flex: 1 }}>
            <Text style={style.titleText}>{challengeTitle}</Text>
            <Text style={style.titleWhy}>{challengeWhy}</Text>
          </View>
          <TouchableOpacity style={style.infoButton} onPress={() => btnHandler()} activeOpacity={0.5}>
            <Text style={style.infoText}>{translate("Mountain.info")}</Text>
            <Icon name="arrow-circle-right" size={22} style={style.infoIcon} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

class DetailLine extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { lineTitle, iconName, lineContent } = this.props
    return (
      <View style={{ flexDirection: 'row', padding: 10 }}>
        {/* <Icon name={iconName} size={17} style={{ marginRight: 10, color: COLORS.orange }} /> */}
        <Text style={{ color: COLORS.black, fontSize: 15, fontFamily: 'Avenir-Book', minWidth: 100 }}>{lineTitle}: </Text>
        <Text style={{ color: COLORS.black, fontFamily: 'Avenir-Black', flexShrink: 1 }}>{lineContent}</Text>
      </View>
    )
  }
}

const style = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    zIndex: 0
  },
  phraseBox: {
    flex: 1,
    borderRadius: 10,
    padding: 20,
    position: 'absolute',
    width: 220,
    opacity: 0.9
  },
  phraseCheckedBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    position: 'absolute',
    top: WindowDimensions.height / 3,
    left: WindowDimensions.width / 2 - 110,
    width: 220,
    opacity: 1
  },
  phraseText: {
    color: COLORS.gray,
    width: '100%',
    textAlign: 'center',
    marginBottom: 15
  },
  phraseButton: {
    color: 'white',
    paddingLeft: 10,
    paddingRight: 10,
    height: 30,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 20
  },
  titleMainWrapper: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 3000
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 15,
    padding: 10
  },
  titleText: {
    color: COLORS.black,
    textAlign: 'left',
    fontFamily: 'Avenir-Black',
    fontSize: 24,
  },
  titleWhy: {
    color: COLORS.gray,
    textAlign: 'left',
    fontFamily: 'Avenir-Book',
    fontSize: 18,
  },
  detailContainer: {
    marginTop: 25,
  },
  detailTitle: {
    textAlign: 'left',
    fontWeight: 'bold',
    marginBottom: 20
  },
  textDetails: {
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "flex-start"
  },
  infoIcon: {
    color: "#ffffff",
  },
  infoButton: {
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 8,
    paddingLeft: 15,
    paddingRight: 15,
    minWidth: 110,
    backgroundColor: COLORS.orange,
    borderRadius: 25,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: "center",
  },
  infoText: {
    textAlign: 'center',
    fontFamily: 'Avenir-Book',
    color: COLORS.white,
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 15
  },
  infoBox: {
    width: 250,
    backgroundColor: COLORS.white,
    // position: 'absolute',
    opacity: 0.7,
    // left: (WindowDimensions.width - 250) / 2,
    // top: 20,
    borderRadius: 10,
    padding: 15
  },
  infoTitle: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 15
  }
});