import React, { Component, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    Alert,
    ActivityIndicator,
    Switch,
    Button,
    Platform,
} from "react-native";
import ButtonGD from "../components/ButtonGD";
import TimePicker from "../components/TimePicker";
import WindowDimensions from "../components/WindowDimensions";
import { BaseContainer, SectionTitle, BackArrow } from "../components";
import { Styles } from "../components";
import COLORS from "../assets/Colors";
import * as commonFunctions from "../../utils/common.js";
import * as Matomo from "react-native-matomo";
import WeekdayPicker from "react-native-weekday-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import translate from "../../utils/language";
import moment from "moment";
import { notificationMsgs } from "./Messages";

import * as FirebaseAPI from "../../modules/firebaseAPI.js";
import * as challengesAPI from "../../modules/challengesAPI.js";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";

const date = new Date();

export default class Notification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            days: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 },

            selectedHours: 0,
            selectedMinutes: 0,
            showtime: false,
            allowNotifications: false,
            date: new Date(),
            nContent: [],
            
        };
    }

    async getNotification() {
        const ptype = this.props.navigation.state.params.type;
        const dataObj = await FirebaseAPI.getNotificationCustom(ptype);
        const notifContent = await FirebaseAPI.getNotificationContent(ptype); 
        
        
        this.setState({ nContent: notifContent });

        if (dataObj) {
            let defaultDays = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 0: 0 }
            this.setState({
                allowNotifications: dataObj.allow ? dataObj.allow : null,
                days: dataObj.days ? dataObj.days : defaultDays,
                date: dataObj.time ? new Date(dataObj.time) : new Date()
            });
        }
        this.setState({ loading: false });
    }


    async componentDidMount() {
        commonFunctions.matomoTrack("screen", "Notifications");
        this.getNotification();
        // await Notifications.cancelAllScheduledNotificationsAsync();
        const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
        
        
        
    }

    async handleBack() {
        this.props.navigation.goBack();
    }

    showTimepicker = (value) => {
        this.setState({ showtime: true });
    };

    handleChange = (days) => {
        this.setState(days);
    };

    allowNotifications = async (value) => {
        if (value) {
            //await challengesAPI.registerForLocalNotifications();
            //FirebaseAPI.saveNotificationValue(1);
            this.setState({ allowNotifications: true });
        } else {
            this.setState({ allowNotifications: false });
            //FirebaseAPI.saveNotificationValue(0);
        }
    };

    UpdateNotif = async () => {
        const ptype = this.props.navigation.state.params.type;
        const hours = moment(this.state.date).hours();
        const minutes = moment(this.state.date).minutes();
        const notificationMsgAnt = notificationMsgs[ptype];
        const notificationMsg = this.state.nContent;
        
        await FirebaseAPI.setNotificationCustom(
                ptype,
                this.state.days,
                this.state.date,
                this.state.allowNotifications
            );

        if (this.state.allowNotifications) {
            await challengesAPI.registerForLocalNotifications(
                notificationMsg,
                this.state.days,
                hours,
                minutes,
                ptype
            );
        } else {
            await challengesAPI.resetNotifications(ptype);
        }
        this.handleBack();
    };
    daymapping () {
        let daysMapping = {0: translate("Notification.day0"), 1:translate("Notification.day1"), 2: translate("Notification.day2"), 3: translate("Notification.day3"), 4:translate("Notification.day4"), 5:translate("Notification.day5"), 6:translate("Notification.day6") }
        return daysMapping;
    };

    

    render() {
        const { anualProdData, monthlyProdData, lifetimeProdData } = this.state;
        const { selectedHours, selectedMinutes } = this.state;
//        let daysMapping = {0: 'Su', 1:'M', 2: 'Tu', 3: 'W', 4:'Th', 5:'F', 6:'Sa' }
        
        
        return (
            <BaseContainer>
                <BackArrow
                    handleBackPress={() => this.handleBack()}
                    style={{ flex: 1, paddingBottom: 20, alignItems: "center" }}
                />

                <ScrollView>
                    {this.state.loading ? (
                        <ActivityIndicator size="large" color={COLORS.orange} />
                    ) : (
                        <View
                            style={{
                                marginTop: 55,
                                textAlign: "center",
                                alignItems: "center",
                            }}
                        >
                            <Text style={style.title}>
                                <Text style={style.title}>
                                    {this.props.navigation.state.params.type +
                                        " " +
                                        translate("Notification.title")}
                                </Text>
                                <Text style={style.dot}>.</Text>
                            </Text>

                            <View
                                style={{
                                    alignContent: "flex-start",
                                    alignSelf: "stretch",
                                    padding: 20,
                                }}
                            >
                                <View
                                    style={{
                                        height: 45,
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <Switch
                                        value={this.state.allowNotifications}
                                        onValueChange={(v) => {
                                            this.allowNotifications(v);
                                        }}
                                        trackColor={{
                                            false: COLORS.lightgray,
                                            true: COLORS.orange,
                                        }}
                                    />
                                    <Text
                                        style={[
                                            style.fieldExplanation,
                                            { marginLeft: 10 },
                                        ]}
                                    >
                                        {translate("Notification.allow")}
                                    </Text>
                                </View>
                            </View>
                            <View
                                style={{
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    alignSelf: "stretch",
                                    padding: 20,
                                    paddingBottom: 0,
                                    flexDirection: "row",
                                }}
                            >
                                <Ionicons
                                    name="ios-calendar"
                                    size={27}
                                    style={{
                                        color: COLORS.orange,
                                        marginRight: 15,
                                    }}
                                />
                                <Text
                                    style={{ textAlign: "left", fontSize: 15 }}
                                >
                                    {translate("Notification.remind")}
                                </Text>
                            </View>
                            <WeekdayPicker
                                days={this.state.days}
                                onChange={this.handleChange}
                                style={style.picker}
                                dayStyle={style.day}
                                selColor={COLORS.blue}
                                daysName={this.daymapping()}
                                
                            />

                            <View
                                style={{
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    alignSelf: "stretch",
                                    padding: 20,
                                    paddingBottom: 0,
                                    flexDirection: "row",
                                }}
                            >
                                <Ionicons
                                    name="ios-clock"
                                    size={27}
                                    style={{
                                        color: COLORS.orange,
                                        marginRight: 15,
                                    }}
                                />
                                <Text
                                    style={{ textAlign: "left", fontSize: 15 }}
                                >
                                    {translate("Notification.time")}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => this.showTimepicker()}
                            >
                                <View
                                    style={{
                                        borderColor: COLORS.orange,
                                        borderWidth: 1,
                                        borderRadius: 25,
                                        paddingTop: 0,
                                        paddingBottom: 7,
                                        paddingLeft: 20,
                                        paddingRight: 20,
                                        marginTop: 15,
                                    }}
                                >
                                    <Text
                                        style={
                                            ([style.fieldExplanation],
                                            {
                                                fontSize: 32,
                                                color: COLORS.blue,
                                                marginTop: 10,
                                            })
                                        }
                                    >
                                        {moment
                                            .utc(this.state.date)
                                            .local()
                                            .format("HH:mm")}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            {/* <Button
                                onPress={this.showTimepicker}
                                title={translate("Notification.change")}
                            /> */}
                        </View>
                    )}
                    <View style={{ marginTop: 15 }}>
                        <ButtonGD
                            title={translate("Notification.set")}
                            onpress={() =>
                                this.UpdateNotif(this.props.navigation)
                            }
                        />
                    </View>
                </ScrollView>
                {this.state.showtime && Platform.OS === "ios" ? (
                    <TimePicker
                        date={this.state.date}
                        onChange={(time) => {
                            this.setState({ date: time });
                        }}
                        mode={'time'}
                        onClose={(time) => {
                            this.setState({ showtime: false });
                        }}
                    />
                ) : null}
                {this.state.showtime && Platform.OS != "ios" ? (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={this.state.date}
                        mode={"time"}
                        is24Hour={true}
                        display="default"
                        onChange={(event, value) => {
                            this.setState({ showtime: false, date: value });
                        }}
                    />
                ) : null}
            </BaseContainer>
        );
    }
}

const style = StyleSheet.create({
    title: {
        color: COLORS.black,
        textAlign: "left",
        fontSize: 23,
        fontWeight: "bold",
        fontFamily: "Avenir-Black",
    },
    dot: {
        fontSize: 45,
        color: "#f26f21",
    },
    picker: { padding: 30, marginTop: 30, color: COLORS.blue },
    day: {
        margin: 5,
        color: COLORS.blue,

        backgroundColor: COLORS.gray,
    },
});
