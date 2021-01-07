

// @flow
import moment from "moment";
import React, { Component } from 'react';
import {StyleSheet, View} from "react-native";
import {H1, Icon, Text} from "native-base";
import * as Notifications from 'expo-notifications';
import Expo from 'expo';
import {BaseContainer, Styles, Task} from "../components";

import variables from "../../native-base-theme/variables/commonColor";

async function getToken() {
    // Remote notifications do not work in simulators, only on device
    if (!Expo.Constants.isDevice) {
      return;
    }
    let { status } = await Expo.Permissions.askAsync(
      Expo.Permissions.NOTIFICATIONS,
    );
    if (status !== 'granted') {
      return;
    }
    let value = await Expo.Notifications.getExpoPushTokenAsync();
    console.log('Our token', value);
    /// Send this to a server
  }

export default class Timeline extends React.PureComponent<ScreenProps<>> {


  componentDidMount() {
    getToken();
    this.listener = Notifications.addNotificationReceivedListener(notification => {
      this.handleNotification
    });
  }

  componentWillUnmount() {
    this.listener && this.listener.remove();
  }

  handleNotification = ({ origin, data }) => {
    console.log(
      `Push notification ${origin} with data: ${JSON.stringify(data)}`,
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Expo Notifications Test</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});



//     render(): React.Node {
//         const today = moment();
//         return (
//             <BaseContainer title="Timeline" navigation={this.props.navigation} scrollable>
//                 <View style={[Styles.center, style.heading]}>
//                     <H1>{today.format("MMMM")}</H1>
//                     <View style={Styles.row}>
//                         <Icon name="ios-time" style={{ marginRight: variables.contentPadding }} />
//                         <Text>{today.format("dddd, MMMM D")}</Text>
//                     </View>
//                 </View>
//                 <Task date="2015-05-08 09:30" title="New Icons" subtitle="Mobile App" completed timeline />
//                 <Task
//                     date="2015-05-08 11:00"
//                     title="Design Stand Up"
//                     subtitle="Hangouts"
//                     collaborators={[1, 2, 3]}
//                     timeline
//                 />
//                 <Task date="2015-05-08 14:00" title="New Icons" subtitle="Home App" completed timeline />
//                 <Task date="2015-05-08 16:00" title="Revise Wireframes" subtitle="Company Website" completed timeline />
//             </BaseContainer>
//         );
//     }
// }

// const style = StyleSheet.create({
//     heading: {
//         marginTop: variables.contentPadding * 2
//     }
// });
