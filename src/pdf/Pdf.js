import * as React from 'react';
import { BaseContainer, BackArrow} from "../components";
import { StyleSheet, View, ActivityIndicator, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { Platform } from 'react-native';
import COLORS from "../assets/Colors"
const server = 'https://tlexeurope.s3.eu-central-1.amazonaws.com/pdf'
const pdfUri = 'https://drive.google.com/viewerng/viewer?embedded=true&url='+ server;

export default class Pdf extends React.PureComponent<ScreenProps<>> {

  constructor(props) {
    super(props);
    this.state = { spinnerVisible: true, pdfVisible: 0 };
  }

  hideSpinner() {
    this.setState({ spinnerVisible: false, pdfVisible: 1 });
  }

  handleBack(){
    this.props.navigation.goBack();
  }

  componentDidMount() {
    this.props.navigation.addListener('willBlur', () => {
      //this.setState({ spinnerVisible: true, pdfVisible: 0 })
    })
  }



  render() {
    const webKit = (Platform.OS === 'ios') ? true : false;
    const pdfSource = pdfUri + '/' + this.props.navigation.state.params.url
    console.log (pdfSource);
    return (
      <BaseContainer title={this.props.navigation.state.params.title} navigation={this.props.navigation} backBtn noPadding>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        {this.state.spinnerVisible && (
          <View style={styles.actIndicator} >
            <ActivityIndicator size="large" color={COLORS.orange}/>
          </View>
        )}
        <BackArrow handleBackPress={() => this.handleBack()}/>
        <View style={[styles.container, {opacity:this.state.pdfVisible}]}>
          <WebView
            bounces={false}
            scrollEnabled={true}
            useWebKit={webKit}
            onLoad={() => this.hideSpinner()}
            source={{ uri: pdfSource }} />            
        </View>
      </BaseContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actIndicator: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  }
});