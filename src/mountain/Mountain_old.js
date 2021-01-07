// @flow
import * as React from "react";
import { View, StyleSheet, Dimensions, Button, TouchableOpacity, Alert, Text, ActivityIndicator, StatusBar, TouchableHighlight } from "react-native";
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

export default class Mountain extends React.PureComponent<ScreenProps<>> {

  constructor(props) {
    super(props);
    const { params } = this.props.navigation.state
    this.animImages = [
      require('../../assets/images/walking/step1.jpg'),
      require('../../assets/images/walking/step2.jpg'),
      require('../../assets/images/walking/step3.jpg'),
      require('../../assets/images/walking/step4.jpg'),
      require('../../assets/images/walking/step5.jpg'),
      require('../../assets/images/walking/step6.jpg'),
      require('../../assets/images/walking/step7.jpg'),
      require('../../assets/images/walking/step8.jpg'),
    ];
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
      showPhrase: false,
      phraseLoading: false,
      phraseX: 0,
      phraseY: 0,
      phraseColor: '',
      phraseCaption: '',
      currentPhrase: '',
      btnColor: '',
      phraseText: '',
      challengeKey: params.pkey,
      refreshPoints: false,
      showInfo: false,
      index: 0
    }
  }

  componentDidMount() {
    this.focusListener = this.props.navigation.addListener("didFocus", () => {
      this.setChallengeData(this.state.challengeKey)
      this.setPhrases()
    });
    this.next();
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
      currentDay: currentDay,
      pointStatus: this.getPointsStatus(dataObj, currentDay),
      completed: completed,
      abandoned: abandoned(isFinished, dayChecked, completed, currentDay),
      dayStarted: dayStarted,
      daysRemaining: daysRemaining
    })
  }

  async setPhrases() {
    const dayPhrases = await getPhrases()
    this.setState({ dayPhrases: dayPhrases })
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
    console.log(status)
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

  async checkActiveDay(activeDay, challengeKey) {
    this.setState({ phraseLoading: true })
    let updateResult = await checkDay(challengeKey, activeDay)
    this.setState({ activePointStatus: 'checked', phraseLoading: false, showPhrase: false })
    this.changePoint(activeDay, 'checked')
    this.refs.toast.show('Day checked!', 1000)
  }

  async unCheckActiveDay(activeDay, challengeKey) {
    this.setState({ phraseLoading: true })
    let updateResult = await unCheckDay(challengeKey, activeDay)
    this.setState({ activePointStatus: 'checked', phraseLoading: false, showPhrase: false })
    this.changePoint(activeDay, 'failed')
    this.refs.toast.show('Day unchecked!')
  }

  pointClickHandler = (pointData) => {
    let phraseColor = '#f17023', btnColor = '#03a5c7', phraseCaption = 'Check'
    let dayNum = pointData.index + 1
    let pointStatus = pointData.status
    let currentPhrase = 'Missed'
    if (pointStatus == 'checked') {
      phraseColor = '#03a5c7'
      btnColor = '#f17023'
      phraseCaption = 'Uncheck'
      currentPhrase = this.state.dayPhrases['day' + dayNum]
    }
    this.setState({ showPhrase: true, phraseText: pointData.phrase, phraseColor: phraseColor, btnColor: btnColor, phraseCaption: phraseCaption, currentPhrase: currentPhrase, activePoint: dayNum, activePointStatus: pointStatus })
    this.setPhrasePosition(pointData.x, pointData.y)
  }

  renderPhrase = (x, y, phrase, color, btnColor, phraseCaption) => {
    if (this.state.showPhrase) {
      return (
        <View style={[style.phraseBox, { left: x, top: y, backgroundColor: color }]}>
          <View style={{ flexGrow: 1 }}>
            <Text style={style.phraseText}>{phrase}</Text>
          </View>
          <View>
            <PhraseBtn caption={phraseCaption} btnColor={btnColor} loading={this.state.phraseLoading} onBtnClick={this.phraseClickHandler} />
          </View>
        </View>
      );
    } else {
      return null;
    }
  }

  btnInfoHandler = () => {
    this.setState({ showInfo: true })
  }

  btnCloseInfoHandler = () => {
    this.setState({ showInfo: false })
  }

  renderInfo = (currentDay, dayStarted, daysRemaining, challengeTitle, challengeWhat, challengeWhy, closeInfo) => {
    if (this.state.showInfo) {
      return (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 20, alignItems: 'center' }}>
          <AnimatedView style={style.infoBox}>
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={() => closeInfo()}>
                <Ionicons name="md-close-circle" size={20} style={{ color: COLORS.orange }} />
              </TouchableOpacity>
            </View>
            <View><Text style={style.infoTitle}>Challenge Info</Text></View>
            <View>
              <DetailLine lineTitle="What" iconName="calendar-alt" lineContent={challengeWhat} />
              <DetailLine lineTitle="Day Started" iconName="calendar-alt" lineContent={dayStarted} />
              <DetailLine lineTitle="Days Remaining" iconName="calendar-alt" lineContent={daysRemaining} />
            </View>
          </AnimatedView>
        </View>
      );
    } else {
      return null;
    }
  }

  setPhrasePosition(x, y) {
    let px = (x < 200) ? x - 25 : x - 150
    let py = y - 87;
    this.setState({ phraseX: px, phraseY: py })
  }

  clickOut = () => {
    this.setState({ showPhrase: false })
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
    const { phraseX, phraseY, phraseColor, btnColor, currentDay, currentPhrase, dayStarted, daysRemaining, challengeTitle, challengeWhat, challengeWhy, refreshPoints, phraseCaption } = this.state
    const points = [
      { x: 330, y: 443 },
      { x: 284, y: 439 },
      { x: 237, y: 432 },
      { x: 192, y: 426 },
      { x: 141, y: 416 },
      { x: 99, y: 410 },
      { x: 49, y: 401 },
      { x: 88, y: 383 },
      { x: 138, y: 364 },
      { x: 193, y: 342 },
      { x: 239, y: 323 },
      { x: 278, y: 306 },
      { x: 229, y: 284 },
      { x: 188, y: 264 },
      { x: 149, y: 243 },
      { x: 113, y: 226 },
      { x: 145, y: 201 },
      { x: 175, y: 177 },
      { x: 197, y: 157 },
      { x: 190, y: 116 },
      { x: 183, y: 67 },
    ];

    return (
      <BaseContainer title='Mountain' navigation={this.props.navigation} backBtn>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <BackArrow handleBackPress={() => this.handleBack()} />
        <Title challengeTitle={this.props.navigation.state.params.title} challengeWhy={this.state.challengeWhy} btnHandler={this.btnInfoHandler} />
        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
          <Svg class="ad-SVG" width="355" height="475" onPress={this.clickOut}>
            <Image
              width="355"
              height="475"
              href={require('../../assets/images/mountain-bg.png')}
            />
            {/* <Image
              width="100"
              height="147"
              href={this.animImages[this.state.index]}
            /> */}
            <Path class="ad-Path"
              d="M 330 443 L 284 439 L 237 432 L 192 426 L 141 416 L 99 410 L 49 401 L 88 383 L 138 364 L 193 342 L 239 323 L 278 306 L 229 284 L 188 264 L 149 243 L 113 226 L 145 201 L 175 177 L 197 157 L 190 116 L 183 67 "
              fill="none"
              stroke="white" />
            <G class="ad-Points">
              {
                points.map((point, i) => {
                  return <Point key={i} x={point.x} y={point.y} status={this.state.pointStatus[i]} onPointClick={this.pointClickHandler} index={i} refresh={refreshPoints} />
                })
              }
            </G>
          </Svg>
          {this.renderPhrase(phraseX, phraseY, currentPhrase, phraseColor, btnColor, phraseCaption)}
          {this.renderInfo(currentDay, dayStarted, daysRemaining, challengeTitle, challengeWhat, challengeWhy, this.btnCloseInfoHandler)}
          <Toast ref="toast"
            style={{ backgroundColor: 'green' }}
            position='top'
            positionValue={70}
            fadeInDuration={1000}
            fadeOutDuration={1000}
            opacity={0.8} />
        </View>
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
        color = '#f17023';
        break;
      case 'checked':
        color = '#03a5c7';
        break;
      case 'pending':
        color = '#dbdcde'
        break;
      default:
        color = '#dbdcde';
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
          <View style={[style.phraseButton, { backgroundColor: this.props.btnColor }]}>
            <Text style={{ color: 'white' }}>{this.props.caption}</Text>
          </View>
        </TouchableOpacity>
      )
    } else {
      return (
        <ActivityIndicator size="small" color="#ffffff" />
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
          <View>
            <Text style={style.titleText}>{challengeTitle}</Text>
            <Text style={style.titleWhy}>{challengeWhy}</Text>
          </View>
          <TouchableOpacity style={style.infoButton} onPress={() => btnHandler()}>
            <Text style={style.infoText}>+ info</Text>
            <Icon name="arrow-circle-right" size={18} style={style.infoIcon} />
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
        <Icon name={iconName} size={17} style={{ marginRight: 10, color: COLORS.orange }} />
        <Text style={{ color: COLORS.black, fontSize: 15 }}>{lineTitle}: {lineContent}</Text>
      </View>
    )
  }
}

const style = StyleSheet.create({
  phraseBox: {
    flex: 1,
    borderRadius: 10,
    padding: 20,
    position: 'absolute',
    width: 220,
    height: 180,
    opacity: 0.7
  },
  phraseTextbox: {
    color: 'white',
    width: '100%',
    textAlign: 'left',
    backgroundColor: 'red'
  },
  phraseButton: {
    color: 'white',
    width: 120,
    height: 30,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  titleMainWrapper: {
    marginTop: 40
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 15,
    padding: 10
  },
  titleText: {
    color: COLORS.gray,
    textAlign: 'left',
    fontSize: 24,
  },
  titleWhy: {
    color: COLORS.lightgray,
    textAlign: 'left',
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
    paddingTop: 7,
    paddingBottom: 6,
    backgroundColor: COLORS.orange,
    borderRadius: 25,
    width: 90,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: "center",
  },
  infoText: {
    textAlign: 'center',
    color: COLORS.white,
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 13
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