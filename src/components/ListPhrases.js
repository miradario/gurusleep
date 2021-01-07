import React, { Component } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ScreenProps } from './Types';
import { FavButton, LockButton, Styles } from '.';
import WindowDimensions from './WindowDimensions';
import COLORS from '../assets/Colors';
import i18n from 'i18n-js';
import { getWeeklyNotifications } from '../../modules/firebaseAPI';
import translate from '../../utils/language';
import { checkInternetConnection, NetworkConsumer } from 'react-native-offline';

const baseURL = 'https://tlexeurope.s3.eu-central-1.amazonaws.com/images/weekly/';

export default class ListMeditate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phrases: [],
      connected: true,
      loading: true,
      monthName: '',
    };
  }

  componentDidMount() {
    this.getPhrases();
  }

  getPhrases = async () => {
    const key = this.props.navigation.getParam('key', '');
    const name = this.props.navigation.getParam('name', '');
    let phrases = [];
    console.log('Key: ' + key);
    if (key) {
      phrases = await getWeeklyNotifications(key);
    }
    this.setState({
      monthName: name,
      phrases,
      loading: false,
    });
  };

  render(): React.Node {
    return (
      <View style={styles.container}>
        <NetworkConsumer>
          {({ isConnected }) =>
            isConnected ? (
              <View style={styles.meditationsArea}>
                {!this.state.loading ? (
                  <MeditationRow
                    phrases={this.state.phrases}
                    title={this.state.monthName}
                    navigation={this.props.navigation}
                  />
                ) : (
                  <View style={styles.activityIndicatorWrapper}>
                    <ActivityIndicator color="orange" size="large" />
                  </View>
                )}
              </View>
            ) : (
              <NoInternet />
            )
          }
        </NetworkConsumer>
      </View>
    );
  }
}

const NoInternet = () => (
  <View style={{ marginTop: 10, padding: 30, alignContent: 'center' }}>
    <Text style={{ color: COLORS.gray, fontSize: 15, textAlign: 'center' }}>
      No internet connection. You can still play contents in the downloads section.
    </Text>
  </View>
);

class MeditationThumb extends React.PureComponent {
  onThumbClick() {
    this.props.navigation.navigate('Phrase', { title: this.props.id, text: this.props.text, id: this.props.id });
  }

  render() {
    let { id, title, text } = this.props;
    return (
      <View style={[styles.meditationThumb, Styles.shadow]}>
        <TouchableOpacity activeOpacity={0.5} onPress={() => this.onThumbClick()}>
          <Image
            style={[styles.meditationThumbImage, { backgroundColor: COLORS.lightgray }]}
            resizeMode="cover"
            //source={{ uri: urlimg + id + '_thumb.png' }}
            source={{ uri: `${baseURL}${id}_thumb.jpg` }}
          ></Image>
          <View style={styles.thumbTitle}></View>
          <Text style={styles.thumbTitleText}>{title}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class MeditationRow extends React.PureComponent {
  renderItem = (data) => (
    <MeditationThumb id={data.id} title={data.title} text={data.desc} navigation={this.props.navigation} />
  );

  render() {
    const { phrases, title } = this.props;
    return (
      <View style={styles.meditationRowWrapper}>
        <View style={styles.meditationRow}>
          <Text style={styles.meditationRowTitle}>{title}</Text>
        </View>
        <FlatList
          style={{ alignSelf: 'stretch' }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          horizontal={false}
          numColumns={2}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          data={phrases}
          renderItem={({ item }) => this.renderItem(item)}
          extraData={this.props.userPremium}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    flex: 0.81,
    backgroundColor: 'transparent',
  },
  loginContainer: {
    alignItems: 'center',
    flexGrow: 0.95,
    justifyContent: 'center',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  header: {
    width: WindowDimensions.width,
    resizeMode: 'contain',
    flex: 1,
    position: 'absolute',
    top: 0,
    zIndex: 1000,
  },
  dashboard: {
    flex: 0.25,
    backgroundColor: 'red',
    borderRadius: 30,
    marginTop: -25,
  },
  loadingCover: {
    width: WindowDimensions.width,
    height: WindowDimensions.height,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10000000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingGradient: {
    paddingTop: WindowDimensions.height / 3,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'stretch',
  },
  loadingText: {
    color: COLORS.white,
    fontSize: 15,
  },
  meditationsArea: {
    marginTop: 10,
    flex: 1,
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingLeft: 3,
    paddingRight: 3,
  },
  categoryWrapper: {
    height: 30,
    marginTop: 15,
  },
  meditationThumb: {
    marginTop: 15,
    paddingLeft: 7,
    paddingRight: 7,
  },
  meditationThumbImage: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: WindowDimensions.width * 0.4,
    height: WindowDimensions.width * 0.4 * (140 / 130),
    opacity: 0.9,
    borderRadius: 15,
  },
  thumbTitle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#000000',
    flexWrap: 'wrap',
    opacity: 0.5,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  thumbTitleText: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    flexShrink: 1,
    textAlign: 'center',
    color: COLORS.white,
    padding: 5,
  },
  categoryTitle: {
    height: 30,
    padding: 15,
    paddingTop: 5,
    paddingBottom: 5,
    marginRight: 15,
    backgroundColor: COLORS.blue,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbcategoryText: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.white,
  },
  meditationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 20,
  },
  meditationRowWrapper: {
    flex: 1,
    alignContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 25,
    alignSelf: 'stretch',
    paddingLeft: 10,
    paddingRight: 10,
  },
  meditationRowTitle: {
    color: COLORS.blue,
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  btnFavWrapper: {
    position: 'absolute',
    top: 7,
    right: 7,
  },
  activityIndicatorWrapper: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    height: 500,
  },
});
