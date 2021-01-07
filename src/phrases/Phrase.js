import * as React from 'react';
import {
  Button,
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ButtonGD from '../components/ButtonGD';
import { getCurrentWeeklyNotification, getPreviousNotification } from '../../modules/firebaseAPI';
import { BaseContainer, BackArrow } from '../components';

import * as FirebaseAPI from '../../modules/firebaseAPI.js';
import COLORS from '../assets/Colors';
import Share from 'react-native-share';
import Images from '../components/images';
import ViewShot, { captureRef } from 'react-native-view-shot';
import translate from '../../utils/language';

const { width, height } = Dimensions.get('window');
const baseURL = 'https://tlexeurope.s3.eu-central-1.amazonaws.com/images/weekly/';
const baseURLtest = 'https://tlexeurope.s3.eu-central-1.amazonaws.com/images/weekly/20201116.jpg';

export default class Phrase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      notification: {},
      showCurrent: true,
      snapshot: undefined,
      text: '',
      shareButtontxt: 'Share',
      sharing: false,
    };
    this.card = React.createRef();
  }

  realtakeSnapshot = async () => {
    console.log('aqui' + this.card.current);
    if (this.card.current) {
      const snapshot = await captureRef(this.card, {
        result: 'data-uri',
      });
      this.setState({
        snapshot,
      });
      const title = translate('Share.share');
      const message = translate('Share.platform_ask');
      const buttons = [
        { text: translate('Share.IGs'), onPress: () => this.shareToInstagramStory(snapshot) },
        { text: translate('Share.share'), onPress: () => this.shareSingleImage(snapshot) },
      ];
      Alert.alert(title, message, buttons);
    }
  };



  shareToInstagramStory = async (snapshot) => {
    const shareOptions = {
      title: 'Share image to instastory',
      method: Share.InstagramStories.SHARE_BACKGROUND_IMAGE,
      backgroundImage: snapshot,
      social: Share.Social.INSTAGRAM_STORIES,
    };

    try {
      const ShareResponse = await Share.shareSingle(shareOptions);
      setResult(JSON.stringify(ShareResponse, null, 2));
    } catch (error) {
      /*     console.log('Error =>', error);
      setResult('error: '.concat(getErrorString(error))); */
    }
  };

  componentDidMount() {
    this.getNotificationData();
  }

  shareSingleImage = async (snapshot) => {
    const shareOptions = {
      title: 'Share file',
      url: snapshot,
      failOnCancel: false,
    };

    try {
      const ShareResponse = await Share.open(shareOptions)
        .then((res) => {
          console.log(res);
          // this.setState({text: this.state.notification.desc, sharing:false})
        })
        .catch((err) => {
          //  this.setState({text: this.state.notification.desc, sharing:false})
          console.log(err);
        });

      //setResult(JSON.stringify(ShareResponse, null, 2));
    } catch (error) {
      console.log('Error =>', error);
      //setResult('error: '.concat(getErrorString(error)));
    }
    // this.setState({text: this.state.notification.desc})
  };

  getNotificationData = async () => {
    const notification = await getCurrentWeeklyNotification();
    this.setState({ notification, loading: false, text: notification.desc });
  };

  handleBack = () => {
    this.props.navigation.goBack();
  };

  handlePrevInspiration = async () => {
    this.setState({ loading: true });
    if (this.state.showCurrent) {
      const prevNotification = await getPreviousNotification();
      this.setState({ loading: false, notification: prevNotification, showCurrent: false });
    } else {
      const currentNotification = await getCurrentWeeklyNotification();
      this.setState({ loading: false, notification: currentNotification, showCurrent: true });
    }
  };

  render() {
    const { id, title, desc } = this.state.notification;
    const { showCurrent } = this.state;
    const { text } = this.state;

    return (
      <BaseContainer>
        <ShowPrev
          handlePress={this.handlePrevInspiration}
          label={showCurrent ? translate('Share.previous') : translate('Share.current')}
          next={showCurrent}
        />
        {this.state.loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.orange} />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <View style={styles.mainWrapper}>
              {/* <View style={{ position: 'absolute', left: 0, right: 0, zIndex: 100000 }}>
                <Image
                  source={require('../../assets/images/quotes.png')}
                  style={{ height: 60, width: 60, alignSelf: 'center' }}
                />
              </View> */}
              <View style={styles.imageContainer}>
                <Image source={{ uri: `${baseURL}${id}.jpg` }} resizeMode="cover" style={styles.image} />
              </View>
            </View>
            <ScrollView style={styles.textContainer}>
              <Text style={styles.mainText}>{desc}</Text>
            </ScrollView>

            <ShareBtn handlePress={this.realtakeSnapshot} label={translate('Share.share')} />
            {/* <ShareBtn handlePress={this.realtakeSnapshot} label="Instragam Histories" /> */}

            <View style={{ flex: 3, marginTop: 60 }}>
              <ViewShot ref={this.card} style={{ backgroundColor: COLORS.white }}  options={{ format: "jpg", width:600, height: 800, quality: 0.3 }}>
                <View style={styles.mainWrapper}>
                  <View style={{ position: 'absolute', left: 0, right: 0, zIndex: 100000 }}>
                    <Image
                      source={require('../../assets/images/quotes.png')}
                      style={{ height: 60, width: 60, alignSelf: 'center' }}
                    />
                  </View>
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: `${baseURL}${id}.jpg` }} resizeMode="cover" style={styles.image} />
                  </View>
                </View>
                <ScrollView style={styles.textContainer}>
                  <Text style={styles.mainText}>{title}</Text>
                </ScrollView>

                <View style={styles.LogoBtnWrapper}>
                  <Image source={Images.tlex_orig} style={styles.tlexLogo}></Image>
                </View>
              </ViewShot>
            </View>
          </View>
        )}
      </BaseContainer>
    );
  }
}

const ShowPrev = (props) => (
  <View style={[styles.prevButtonWrapper, props.next ? { left: 25 } : { right: 25 }]}>
    <TouchableOpacity onPress={props.handlePress}>
      <View style={styles.prevButton}>
        <View style={styles.prevCircle}>
          <Image
            source={require('../../assets/images/arrow_left.png')}
            style={[{ width: 13, height: 13 }, { transform: [{ rotateY: props.next ? '0deg' : '180deg' }] }]}
          />
        </View>
        <Text style={styles.prevText}>{props.label}</Text>
      </View>
    </TouchableOpacity>
  </View>
);

const ShareBtn = (props) => (
  <View style={styles.shareBtnWrapper}>
    <TouchableOpacity onPress={props.handlePress}>
      <View style={styles.shareButton}>
        <Image source={require('../../assets/images/share_icon.png')} style={{ width: 25, height: 25 }} />
        <Text style={styles.shareText}>{props.label}</Text>
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  mainWrapper: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 70,
  },
  imageContainer: {
    marginTop: 20,
    height: width * 0.65,
    backgroundColor: COLORS.white,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: COLORS.lightgray,
  },
  title: {
    color: COLORS.blue,
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  image: {
    flex: 1,
    height: undefined,
    width: undefined,
  },
  textContainer: {
    backgroundColor: COLORS.white,
    //padding: 10,
    paddingLeft: 25,
    paddingRight: 25,
    //paddingTop: 15,
    paddingBottom: 0,
    flexGrow: 1,
    height: 180,
    marginTop: 15,
    //    justifyContent: 'center',
  },
  mainText: {
    color: COLORS.black,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Avenir-Book',
    textAlign: 'justify',
  },
  interactionsContainter: {
    height: 70,
    alignSelf: 'stretch',
    backgroundColor: COLORS.white,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  interactionIcon: {
    color: COLORS.orange,
    marginLeft: 20,
  },
  prevButtonWrapper: {
    position: 'absolute',
    zIndex: 10000,
    // left: 25,
    top: 15,
  },
  prevButton: {
    height: 40,
    backgroundColor: COLORS.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    padding: 10,
  },
  prevText: {
    color: COLORS.white,
    fontFamily: 'Avenir-Book',
    fontSize: 14,
  },
  prevCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 30,
    marginRight: 20,
    marginTop: 38,
  },
  shareButton: {
    height: 35,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    padding: 5,
    paddingLeft: 20,
    paddingRight: 20,
  },
  shareText: {
    marginLeft: 15,
    color: COLORS.white,
    fontFamily: 'Avenir-Book',
    fontSize: 15,
  },
  tlexLogo: {
    alignItems: 'center',
    width: 68,
    height: 49,
    resizeMode: 'contain',
  },

  LogoBtnWrapper: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 30,
    paddingBottom: 0,
  },
});
