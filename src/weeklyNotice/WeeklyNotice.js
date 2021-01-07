import React, { Component } from 'react';
import { StyleSheet, View, ScrollView, Text, Dimensions, TouchableOpacity, Image } from 'react-native';
import Constants from 'expo-constants';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../assets/Colors';
import translate from '../../utils/language';

import { getCurrentWeeklyNotification, getPreviousNotification } from '../../modules/firebaseAPI';

const { width, height } = Dimensions.get('window');
const baseURL = 'https://tlexeurope.s3.eu-central-1.amazonaws.com/images/weekly/';

export default class WeeklyNotice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      notification: {},
      text: '',
    };
  }

  componentDidMount() {
    this.getNotificationData();
  }

  getNotificationData = async () => {
    const notification = await getCurrentWeeklyNotification();
    this.setState({ notification, loading: false, text: notification.desc });
    console.log(`${baseURL}${notification.id}.jpg`);
  };

  goToInspiration = () => {
    this.props.navigation.navigate('Phrase');
  };

  render() {
    const { id, title, desc } = this.state.notification;
    const { text } = this.state;

    if (this.props.show) {
      return (
        <View style={styles.mainWrapper}>
          <View style={styles.overlay}></View>
          <Animatable.View style={styles.mainView} animation="bounceIn">
            <TouchableOpacity style={styles.closeButtonWrapper} onPress={this.props.onClose}>
              <View style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.imageContainer}>
              <Image source={{ uri: `${baseURL}${id}.jpg` }} resizeMode="cover" style={{ flex: 1 }} />
            </View>
            <ScrollView style={styles.textContainer}>
              <Text style={styles.mainText}>{text}</Text>
            </ScrollView>
            <View style={styles.interactionsContainter}>
              <ActionButton label={translate('Weeklyphrases.gotoinspiration')} handlePress={this.goToInspiration} />
              {/* <Ionicons name="ios-share" size={50} style={styles.interactionIcon} />
              <Ionicons name="ios-heart" size={30} style={styles.interactionIcon} /> */}
            </View>
          </Animatable.View>
        </View>
      );
    } else {
      return null;
    }
  }
}

const ActionButton = (props) => (
  <View style={styles.prevButtonWrapper}>
    <TouchableOpacity onPress={props.handlePress}>
      <View style={styles.prevButton}>
        {/* <View style={styles.prevCircle}>
          <Image
            source={require('../../assets/images/arrow_left.png')}
            style={[{ width: 13, height: 13 }, { transform: [{ rotateY: props.next ? '0deg' : '180deg' }] }]}
          />
        </View> */}
        <Text style={styles.prevText}>{props.label}</Text>
      </View>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  mainView: {
    position: 'absolute',
    marginTop: Constants.statusBarHeight + 20,
    zIndex: 100000000,
    borderRadius: 30,
    borderColor: COLORS.lightgray,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    height: height - 180,
    width: width - 30,
    padding: 20,
    alignSelf: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: width - 30 - 40,
    alignSelf: 'stretch',
    backgroundColor: COLORS.white,
    borderRadius: 50,
    overflow: 'hidden',
    marginTop: 20,
  },
  textContainer: {
    flex: 3,
    backgroundColor: COLORS.white,
    alignSelf: 'stretch',
    padding: 15,
    // justifyContent: 'flex-start',
    marginTop: 25,
  },
  closeButtonWrapper: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 2000,
  },
  closeButton: {
    width: 25,
    height: 25,
    borderRadius: 90,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontWeight: '900',
  },
  mainText: {
    color: COLORS.black,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Avenir-Book',
    textAlign: 'justify',
  },
  prevButtonWrapper: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
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
  overlay: {
    position: 'absolute',
    zIndex: 99999999,
    opacity: 0.7,
    backgroundColor: COLORS.gray,
    flex: 1,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  mainWrapper: {
    position: 'absolute',
    zIndex: 99999999,
    flex: 1,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interactionsContainter: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: COLORS.white,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  interactionIcon: {
    color: COLORS.blue,
    marginLeft: 20,
  },
});
