import * as React from 'react';
import { BaseContainer, BackArrow } from '../components';
import { StatusBar } from 'react-native';
import ListPhrases from '../components/ListPhrases';
import * as commonFunctions from '../../utils/common.js';
import { checkInternetConnection, NetworkConsumer } from 'react-native-offline';
import { NoInternet } from '../meditate/NoInternet';

export default class PhrasesDetail extends React.Component<ScreenProps<>> {
  constructor() {
    super();
    this.state = {
      rerender: false,
      connected: true,
    };
  }

  async componentDidMount() {
    const connected = await checkInternetConnection();
    this.setState({ connected });
    commonFunctions.matomoTrack('screen', 'PhrasesDetail');
  }

  handleBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    return (
      <NetworkConsumer>
        {({ isConnected }) =>
          isConnected ? (
            <BaseContainer title={'Weekly Phrases'}>
              <StatusBar backgroundColor="white" barStyle="dark-content" />
              <BackArrow handleBackPress={this.handleBack} />
              <ListPhrases navigation={this.props.navigation}></ListPhrases>
            </BaseContainer>
          ) : (
            <NoInternet />
          )
        }
      </NetworkConsumer>
    );
  }
}
