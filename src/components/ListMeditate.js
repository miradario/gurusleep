import moment from 'moment';
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { H3 } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import type { ScreenProps } from '../components/Types';
import { FavButton, LockButton, Styles } from '../components';
import { getContent, getFavouritesID, removeFav, addFav } from '../../modules/firebaseAPI';
import variables from '../../native-base-theme/variables/commonColor';
import { Video } from 'expo';
import WindowDimensions from './WindowDimensions';
import COLORS from '../assets/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import i18n from 'i18n-js';
import Toast, { DURATION } from 'react-native-easy-toast';
import * as FirebaseAPI from '../../modules/firebaseAPI.js';
import translate from '../../utils/language';
import { checkInternetConnection, NetworkConsumer } from 'react-native-offline';
// import { ActivityIndicator } from "react-native-paper";
// import * as InAppPurchases from 'expo-in-app-purchases';

// const urlimg = 'https://gesundes-und-achtsames-fuehren.de/assets/app/image/';
const urlimg = 'https://tlexeurope.s3.eu-central-1.amazonaws.com/images/portaits/';

export default class ListMeditate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      meditations: [],
      favourites: [],
      selectedCat: props.initialCat,
      premium: false,
      lifetime: false,
      connected: true,
      sections: {
        BreathPrivate: [{ icon: 'ios-leaf', title: translate('Breath.course') }],
        BreathPublic: [{ icon: 'ios-rocket', title: translate('Breath.tools') }],
        Mindfulness: [
          {
            icon: 'ios-infinite',
            title: translate('Mindfulness.mindfulness'),
          },
        ],

        Sleep: [{ icon: 'md-moon', title: translate('Mindfulness.sleep') }],
        Walk: [{ icon: 'ios-walk', title: translate('Mindfulness.walk') }],
        Music: [
          {
            icon: 'ios-musical-note',
            title: translate('Mindfulness.music'),
          },
        ],

        DesktopYoga: [{ icon: 'md-body', title: translate('Work.streching') }],
        Desktop: [{ icon: 'ios-desktop', title: translate('Work.desk') }],
        MicroMoments: [{ icon: 'md-flashlight', title: translate('Work.micro') }],
        Meetings: [{ icon: 'ios-people', title: translate('Work.meetings') }],
        //ios-musical-note
      },
    };
  }

  componentDidMount() {
    this.setContentData(this.props.cat[this.props.initialCat]);
    this.getFavs();

    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      if (i18n.changelocale) {
        this.setContentData(this.state.selectedCat);
        this.getFavs();
      }
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.rerender) {
      this.setContentData(this.props.cat[this.state.selectedCat]);
    }
  }

  setContentData = async (category) => {
    const categ = this.state.sections[category];
    let filtersky=false;
    this.setState({ icon: categ[0].icon, title: categ[0].title });
    const dataObj = await FirebaseAPI.getUser();
    workshopcode = dataObj.workshopcode;

  console.log ('workshoppremium' + dataObj.premium);
     if (workshopcode != '') {
        let workshop= await FirebaseAPI.getWorkshop(workshopcode)
        filtersky=(workshop['sky']=='no');
     }


    let dataSetMeditations = await getContent(category, filtersky);
    
    let premium = false;
    let lifetime = false;

    console.log ('workshoppremium' + dataObj.premium);
    
  


    if (dataObj.premium != null) {
      premium = dataObj.premium;
    }
    if (dataObj.lifetime != null) {
      lifetime = dataObj.lifetime;
    }
    if (premium == false) {
      
      if (workshopcode != '') {
        let validworkshop = await FirebaseAPI.validateworkshop(workshopcode);
        if (validworkshop == 1) {
          this.setState({
            workshopPremium: await FirebaseAPI.getWorkshop(workshopcode),
          });
          premium = this.state.workshopPremium['Premium'];     
        }
      }
    }
    console.log ('premium' + premium);
    this.setState({
      meditations: dataSetMeditations,
      category,
      contentReady: true,
      premium,
      lifetime
      
    });
  };

  async getFavs() {
    let favourites = await getFavouritesID();
    this.setState({ favourites: favourites });
  }

  handleHeartClick = async (currentState, key, type) => {
    if (currentState) {
      let favs = [...this.state.favourites];
      favs.splice(favs.indexOf(key), 1);
      this.setState({ favourites: favs });
      await removeFav(key);
    } else {
      let favs = [...this.state.favourites];
      favs.push(key);
      this.setState({ favourites: favs });
      await addFav(key, type, this.state.category);
      this.refs.toast.show('Added to favourites', 1000);
    }
  };

  handleCategoryChange = (category, id) => {
    this.setState({ contentReady: false, selectedCat: id });
    this.setContentData(category);
  };

  render(): React.Node {
    const { cat } = this.props;
    const today = moment();
    const date = today.format('MMMM D');
    const dayOfWeek = today.format('dddd').toUpperCase();
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <Toast
          ref="toast"
          style={{ backgroundColor: COLORS.orange }}
          position="top"
          positionValue={WindowDimensions.height / 3}
          fadeInDuration={1000}
          fadeOutDuration={3000}
          opacity={0.9}
        />
        <NetworkConsumer>
          {({ isConnected }) =>
            isConnected ? (
              <View style={styles.meditationsArea}>
                <View style={styles.categoryWrapper}>
                  <FlatList
                    refresh={this.state.selectedCat}
                    data={cat}
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    renderItem={({ item, index }) => (
                      <CategoryButton
                        section={this.state.sections}
                        category={item}
                        categoryChange={this.handleCategoryChange}
                        id={index}
                        active={this.state.selectedCat == index}
                      />
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    ListHeaderComponentStyle={{
                      justifyContent: 'space-between',
                    }}
                  />
                </View>
                {this.state.contentReady ? (
                  <MeditationRow
                    meditations={this.state.meditations}
                    favs={this.state.favourites}
                    title={this.state.title}
                    icon={this.state.icon}
                    userPremium={this.state.premium}
                    lifetime={this.state.lifetime}
                    navigation={this.props.navigation}
                    selCat={this.props.cat[this.state.selectedCat]}
                    handleHeartClick={this.handleHeartClick}
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

class CategoryButton extends React.PureComponent {
  handleCategoryChange = () => {
    this.setState({ selected: true });
    this.props.categoryChange(this.props.category, this.props.id);
  };

  render() {
    let catego = this.props.section[this.props.category];

    let categ = catego[0].title;
    if (categ == 'DesktopYoga') {
      categ = 'Desktop Streching';
    }

    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          this.handleCategoryChange();
        }}
      >
        <LinearGradient
          colors={[
            this.props.active ? COLORS.blue : COLORS.orange,
            this.props.active ? COLORS.lightblue : COLORS.lightgray,
          ]}
          start={[0.6, 0.5]}
          end={[1, 0]}
          style={styles.categoryTitle}
        >
          <Text style={styles.thumbcategoryText}>{categ}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
}

class MeditationThumb extends React.PureComponent {
  buyProduct = () => {
    this.props.navigation.navigate('BuyModal', { origin: 'meditations' });
  };

  onFavClick = () => {
    this.props.handleHeartClick(this.props.isfav, this.props.id, this.props.type);
  };

  onThumbClick(locked) {
    if (locked) {
      this.buyProduct();
    } else {
      if (this.props.type == 'audio') {
        this.props.navigation.navigate('Audios', {
          category: this.props.selCat,
          Description: this.props.Description,
          duration: this.props.duration,
          trainer: this.props.trainer,
          music: this.props.music,
          key: this.props.id,
          title: this.props.title,
          photo: urlimg + this.props.id + '_cover.jpg',
        });
      } else {
        this.props.navigation.navigate('Player', {
          category: this.props.selCat,
          Description: this.props.Description,
          duration: this.props.duration,
          trainer: this.props.trainer,
          key: this.props.id,
          title: this.props.title,
          photo: urlimg + this.props.id + '_cover.jpg',
        });
      }
    }
  }

  render() {
    const { isfav, premium, userPremium, lifetime } = this.props;
    let locked = true;
    let heartColor = COLORS.lightgray;
    // let title = this.props.title.length > 20 ? this.props.title.substring(0, 18) + "..." : this.props.title
    let title = this.props.title;
    if (isfav) {
      heartColor = COLORS.orange;
    }

    if (userPremium || !premium || lifetime) {
      locked = false;
    }


  

    return (
     <View>

     
      <View style={[styles.meditationThumb, Styles.shadow]}>
       
        <TouchableOpacity activeOpacity={0.5} onPress={() => this.onThumbClick(locked)}>
          <Image
            style={[styles.meditationThumbImage, { backgroundColor: COLORS.lightgray }]}
            resizeMode="cover"
            source={{ uri: urlimg + this.props.id + '_thumb.png' }}
          ></Image>
          <FavButton handleFavPress={() => this.onFavClick()} heartColor={heartColor} />
          <LockButton locked={locked} />
          <View style={styles.thumbTitle}></View>

          <Text style={styles.thumbTitleText}>{title}</Text>
        </TouchableOpacity>
        </View>
     
      </View>
       
      )
    
  }
}

class MeditationRow extends React.PureComponent {

  renderItem = (data) => (
    
    <MeditationThumb
      Description={data.Description}
      duration={data.Duration}
      music={data.music}
      trainer={data.Trainer}
      url={data.url}
      navigation={this.props.navigation}
      id={data.id}
      title={data.title}
      image={data.thumbnail}
      active={data.toggle}
      userPremium={this.props.userPremium}
      lifetime={this.props.lifetime}
      trial={this.props.trial}
      premium={data.Premium}
      lock={data.lock}
      selCat={this.props.selCat}
      isfav={this.props.favs.includes(data.id)}
      handleHeartClick={this.props.handleHeartClick}
      type={data.Type}
    />
  );

  render() {
    const { meditations, title, icon } = this.props;
    return (
      <View style={styles.meditationRowWrapper}>
        <View style={styles.meditationRow}>
          <Ionicons name={icon} style={{ color: COLORS.orange }} size={30} />
          <Text style={styles.meditationRowTitle}>{title}</Text>
        </View>
        <FlatList
          style={{ alignSelf: 'stretch' }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          horizontal={false}
          numColumns={2}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          data={meditations}
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
