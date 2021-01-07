import React, { Component } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Platform, ActivityIndicator, Linking } from 'react-native';
import ButtonGD from '../components/ButtonGD';
import WindowDimensions from '../components/WindowDimensions';
import { BaseContainer, SectionTitle, BackArrow } from '../components';
import { LinearGradient } from 'expo-linear-gradient';
import { Styles } from '../components';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../assets/Colors';
import { savePremiumValue, saveLifeTimePremiumValue, savePurchaseData } from '../../modules/firebaseAPI';
import * as InAppPurchases from 'expo-in-app-purchases';
import { TouchableOpacity } from 'react-native-gesture-handler';
import * as Matomo from 'react-native-matomo';
import * as commonFunctions from '../../utils/common.js';
import translate from '../../utils/language';
import AsyncStorage from '@react-native-community/async-storage';
import RNIap, {
  Product,
  ProductPurchase,
  PurchaseError,
  acknowledgePurchaseAndroid,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';

const prodAnual = Platform.select({
  ios: 'dev.products.anual',
  android: 'anual',
});

const prodMonthly = Platform.select({
  ios: 'dev.products.monthly',
  android: 'monthly',
});

const prodLifetime = Platform.select({
  ios: 'fulllife',
  android: 'fulllife',
});

const storeName = Platform.OS == 'ios' ? 'AppStore' : 'PlayStore';

export default class Purchase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        {
          productId: 'monthly',
          title: 'Monthly Subscription',
          price: '$100',
        },
        {
          productId: 'anual',
          title: 'Anual Subscription',
          price: '$200',
        },
      ],
      anualProdData: {},
      monthlyProdData: {},
      lifetimeProdData: {},
      loading: false,
    };
  }

  componentDidMount() {
    commonFunctions.matomoTrack('screen', 'Purchase');
    this.prepareInApp();
    this.focusListener = this.props.navigation.addListener('didBlur', () => {
      this.disconnectInApp();
    });
  }

  async disconnectInApp() {
    await InAppPurchases.disconnectAsync();
  }

  async prepareInApp() {
    //let history;
    this.setState({ loading: true });
    try {
      const result = await RNIap.initConnection();
      const subs = Platform.select({
        ios: ['dev.products.monthly', 'dev.products.anual'],
        android: ['monthly', 'anual'],
      });
      const products = Platform.select({
        ios: ['fulllife'],
        android: ['fulllife'],
      });
      const subscriptions = await RNIap.getSubscriptions(subs);
      const items = await RNIap.getProducts(products);
      this.setState({ productList: products });

      this.purchaseListener();
      let anualProdData = subscriptions.filter((e) => e.productId === prodAnual);
      let monthlyProdData = subscriptions.filter((e) => e.productId === prodMonthly);
      let lifetimeProdData = items.filter((e) => e.productId === prodLifetime);
      this.setState({
        items: products,
        anualProdData: anualProdData[0],
        monthlyProdData: monthlyProdData[0],
        lifetimeProdData: lifetimeProdData[0],
      });
      this.setState({ loading: false });
    } catch (e) {
      console.log(e);
      this.setState({ loading: false });
    }
  }

  requestPurchase = async (sku: string) => {
    this.setState({ loading: true });
    try {
      await RNIap.requestPurchase(sku, false);
    } catch (err) {
      console.warn(err.code, err.message);
    }
  };

  requestSubscription = async (sku: string) => {
    this.setState({ loading: true });
    try {
      await RNIap.requestSubscription(sku);
    } catch (err) {
      console.warn(err.code, err.message);
    }
  };

  purchaseConfirmed = (purchase) => {
    console.log('Product ID:', purchase.productId);
    if (purchase.productId === 'fulllife') {
      this.enableLifeTime();
    } else {
      this.enablePremium();
    }
    console.log('Purchase confirmed!');
    this.logPurchase(purchase);
    commonFunctions.matomoTrack('purchase', purchase.productId);
    this.handleFinished();
    this.setState({ loading: false });
  };

  purchaseListener() {
    purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase: ProductPurchase) => {
      if (purchase.purchaseStateAndroid === 1 && !purchase.isAcknowledgedAndroid) {
        try {
          const ackResult = await acknowledgePurchaseAndroid(purchase.purchaseToken);
          console.log('ackResult', ackResult);
        } catch (ackErr) {
          console.warn('ackErr', ackErr);
        }
      }
      console.log('Purchase:', purchase);
      this.purchaseConfirmed(purchase);
      this.setState({ receipt: purchase.transactionReceipt });
    });
  }

  async enablePremium() {
    this.storeLocalPremium();
    await savePremiumValue(true);
  }

  async enableLifeTime() {
    await saveLifeTimePremiumValue(true);
  }

  async logPurchase(purchase) {
    if (Platform.OS === 'ios') {
      await RNIap.finishTransactionIOS(purchase.transactionId);
    }
    const receipt = Platform.OS == 'ios' ? purchase.transactionReceipt : 0;
    console.log('Logging purchase...');
    console.log('Order ID:', purchase.transactionId);
    console.log(purchase);
    await savePurchaseData(purchase.transactionId, purchase.transactionDate, purchase.productId, receipt);
    console.log('Purchase logged!');
  }

  handleFinished() {
    let origin = this.props.navigation.getParam('origin', 'meditations');
    if (origin == 'meditations') {
      this.props.navigation.navigate('MainStack', { reload: true });
    } else if (origin == 'walkthrough') {
      this.props.navigation.navigate('Main');
    } else {
      this.props.navigation.navigate('Home', { reload: true });
    }
  }

  async storeLocalPremium() {
    try {
      await AsyncStorage.setItem('premium', 'true');
    } catch (error) {
      console.log(error);
    }
  }

  async handleBack() {
    await InAppPurchases.disconnectAsync();
    this.props.navigation.goBack();
  }

  async buySubscription(itemID) {
    if (Platform.OS == 'ios') {
      this.setState({ loading: true });
    }
    await InAppPurchases.purchaseItemAsync(itemID);
    this.setState({ loading: false });
  }

  render() {
    const { anualProdData, monthlyProdData, lifetimeProdData } = this.state;
    return (
      <BaseContainer>
        <BackArrow
          handleBackPress={() => this.handleBack()}
          style={{ flex: 1, paddingBottom: 20, alignItems: 'center' }}
        />
        <View
          style={{
            marginTop: 25,
            textAlign: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={style.title}>
            <Text style={style.title}>{translate('Purchase.unlock')}</Text>
            <Text style={style.dot}>.</Text>
          </Text>
        </View>
        <ScrollView>
          <View style={style.featureWrapper}>
            <Feature desc={translate('Purchase.meditation')} />
            <Feature desc={translate('Purchase.breathing')} />
            <Feature desc={translate('Purchase.special')} />
            <Feature desc={translate('Purchase.sleep')} />
            <Feature desc={translate('Purchase.music')} />
            <Feature desc={translate('Purchase.walks')} />
            <Feature desc={translate('Purchase.new')} />
          </View>

          {this.state.loading ? (
            <ActivityIndicator size="large" color={COLORS.orange} />
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                // alignSelf: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  this.requestSubscription(monthlyProdData.productId);
                }}
              >
                <LinearGradient
                  colors={[COLORS.blue, COLORS.lightblue]}
                  start={[1, 0.4]}
                  end={[1, 1]}
                  style={[style.productItem, { marginTop: 25 }]}
                >
                  <View
                    style={{
                      padding: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={style.productTitle}>{translate('Purchase.monthly')}</Text>
                    <Text style={style.productPrice}>{monthlyProdData.price}</Text>
                    <Text style={style.productBilling}>{translate('Purchase.billed_monthly')}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  this.requestSubscription(anualProdData.productId);
                }}
              >
                <View
                  style={{
                    borderColor: COLORS.orange,
                    borderRadius: 20,
                    borderWidth: 1,
                    padding: 5,
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.black,
                      fontFamily: 'Avenir-Book',
                      fontSize: 10,
                      padding: 3,
                      textAlign: 'center',
                    }}
                  >
                    {translate('Purchase.most')}
                  </Text>
                  <LinearGradient
                    colors={[COLORS.orange, COLORS.lightorange]}
                    start={[1, 0.4]}
                    end={[1, 1]}
                    style={style.productItem}
                  >
                    <View
                      style={{
                        padding: 10,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={style.productTitle}>{translate('Purchase.yearly')}</Text>
                      <Text style={style.productPrice}>{anualProdData.price}</Text>
                      <Text style={style.productBilling}>{translate('Purchase.billed_yearly')}</Text>
                    </View>
                  </LinearGradient>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.requestPurchase(lifetimeProdData.productId);
                }}
              >
                <LinearGradient
                  colors={[COLORS.blue, COLORS.lightblue]}
                  start={[1, 0.4]}
                  end={[1, 1]}
                  style={[style.productItem, { marginTop: 25 }]}
                >
                  <View
                    style={{
                      padding: 10,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={style.productTitle}>{translate('Purchase.lifetime')}</Text>
                    <Text style={style.productPrice}>{lifetimeProdData.price}</Text>
                    <Text style={style.productBilling}>{translate('Purchase.once')}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
          <View
            style={{
              marginTop: 10,
              padding: 10,
              alignContent: 'center',
            }}
          >
            <Text style={style.disclaimer}>
              {translate('Purchase.workshop1')}{' '}
              <Text
                style={{ textDecorationLine: 'underline' }}
                onPress={() => {
                  this.props.navigation.navigate('Settings');
                }}
              >
                {translate('Purchase.here')}
              </Text>{' '}
              {translate('Purchase.insert_code')}
            </Text>
          </View>
          <View style={{ marginTop: 5, padding: 10, marginBottom: 10 }}>
            <Text style={style.disclaimer}>
              <Text style={[style.disclaimer, { fontFamily: 'Avenir-Black' }]}>{translate('Purchase.terms')} </Text>
              {translate('Purchase.suscription') + storeName + translate('Purchase.suscription2') + ' '}
              <Text
                style={[
                  {
                    textDecorationLine: 'underline',
                    marginTop: 5,
                  },
                  style.disclaimer,
                ]}
                onPress={() => {
                  Linking.openURL('https://selfawareness-and-mindfulness.com/privacy-policy');
                }}
              >
                {translate('Purchase.terms_policy')}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </BaseContainer>
    );
  }
}

class Feature extends React.PureComponent {
  render() {
    const { desc } = this.props;
    return (
      <View style={[style.feature, Styles.shadow]}>
        <View style={style.bullet}>
          <Ionicons name="ios-checkmark-circle" color={COLORS.blue} size={20} />
        </View>
        <View style={style.featureTextWrapper}>
          <Text style={style.featureText}>{desc}</Text>
        </View>
      </View>
    );
  }
}

const style = StyleSheet.create({
  title: {
    color: COLORS.black,
    textAlign: 'left',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Avenir-Black',
  },
  dot: {
    fontSize: 45,
    color: '#f26f21',
  },
  featureWrapper: {
    paddingBottom: 10,
    alignItems: 'flex-start',
    width: 330,
    alignSelf: 'center',
    paddingTop: 5,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'flex-start',
    alignSelf: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  bullet: {
    marginRight: 15,
    flex: 1,
  },
  featureTextWrapper: {
    flex: 16,
  },
  featureText: {
    flexWrap: 'wrap',
    flexShrink: 1,
    fontFamily: 'Avenir-Book',
    fontSize: 12,
  },
  productsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 20,
    alignSelf: 'center',
  },
  productItem: {
    height: 110,
    width: 110,
    borderRadius: 20,
    backgroundColor: COLORS.blue,
  },
  productTitle: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Avenir-Black',
  },
  productPrice: {
    color: '#000000',
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'Avenir-Book',
    marginTop: 12,
  },
  productBilling: {
    color: '#000000',
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'Avenir-Book',
    marginTop: 8,
  },
  disclaimer: {
    fontFamily: 'Avenir-Book',
    color: COLORS.black,
    fontSize: 11,
  },
});
