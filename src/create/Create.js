// @flow
import * as React from "react";
import {
    StyleSheet,
    View,
    Image,
    InteractionManager,
    Dimensions,
    ScrollView,
    FlatList,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    Alert
} from "react-native";
import { Button, Text, Label, Icon } from "native-base";

import { BaseContainer, Avatar, Field, Styles, BackArrow } from "../components";
import type { ScreenProps } from "../components/Types";
// import Date from "./Date";
import { FontAwesome5 } from '@expo/vector-icons';
import { Constants } from "expo";
import moment from "moment";
import variables from "../../native-base-theme/variables/commonColor";
import * as FirebaseAPI from "../../modules/firebaseAPI.js";
import * as challengesAPI from "../../modules/challengesAPI.js";
import firebase from "firebase";
// import DatePicker from "react-native-datepicker";
import ButtonGD from "../components/ButtonGD";
import COLORS from "../assets/Colors";
import translate from '../../utils/language';
import { StackActions } from 'react-navigation';
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import * as Matomo from 'react-native-matomo';
import * as commonFunctions from '../../utils/common.js';
import TimePicker from "../components/TimePicker";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width } = Dimensions.get("window");
const height = width * 0.8;

const cha1 = require("../assets/challenges/challenge-1.png");
const cha2 = require("../assets/challenges/challenge-2.png");
const cha3 = require("../assets/challenges/challenge-3.png");
const cha4 = require("../assets/challenges/challenge-4.png");
const cha5 = require("../assets/challenges/challenge-5.png");
const cha6 = require("../assets/challenges/challenge-6.png");
const cha7 = require("../assets/challenges/challenge-7.png");
const cha8 = require("../assets/challenges/challenge-8.png");
const cha9 = require("../assets/challenges/challenge-9.png");
const cha10 = require("../assets/challenges/challenge-10.png");
const cha11 = require("../assets/challenges/challenge-11.png");
const cha12 = require("../assets/challenges/challenge-12.png");
const cha13 = require("../assets/challenges/challenge-13.png");
const cha14 = require("../assets/challenges/challenge-14.png");
const cha15 = require("../assets/challenges/challenge-15.png");


export default class Create extends React.PureComponent<ScreenProps<>> {
    state = {
        title: "",
        what: "",
        image: "1",
        update: 0,
        selectedHours: 0,
        //initial Hours
        selectedMinutes: 0,
        //initial Minutes
        currentDate: new Date(),
        markedDate: moment(new Date()).format("YYYY-MM-DD"),
        // sdate: new Date(),
        data: [
            { id: "challenge-1", image: cha1, toggle: false },
            { id: "challenge-2", image: cha2, toggle: false },
            { id: "challenge-3", image: cha3, toggle: false },
            { id: "challenge-4", image: cha4, toggle: false },
            { id: "challenge-5", image: cha5, toggle: false },
            { id: "challenge-6", image: cha6, toggle: false },
            { id: "challenge-7", image: cha7, toggle: false },
            { id: "challenge-8", image: cha8, toggle: false },
            { id: "challenge-9", image: cha9, toggle: false },
            { id: "challenge-10", image: cha10, toggle: false },
            { id: "challenge-11", image: cha11, toggle: false },
            { id: "challenge-12", image: cha12, toggle: false },
            { id: "challenge-13", image: cha13, toggle: false },
            { id: "challenge-14", image: cha14, toggle: false },
            { id: "challenge-15", image: cha15, toggle: false },
        ],
        updateSelected: false,
        imgcolor: "white",
        date: new Date()
    };

    promptDeleteChallenge = (nagination, pkey) => {
        const title = 'Delete Challenge' //+ this.props.navigation.state.params.title;
        const message = 'Are you sure you want to delete this Challenge?';
        const buttons = [
            { text: 'Cancel', type: 'cancel' },
            { text: 'Delete Challenge', onPress: () => this.deleteChallenge(nagination, pkey) },
        ];
        Alert.alert(title, message, buttons);
    }

    onPressed = imageID => {
        const { data } = this.state;
        data.forEach(elem => {
            elem.toggle = false;
            if (elem.id == imageID) {
                elem.toggle = true;
            }
        });

        this.setState({ image: imageID });
        this.setState({ data: data });
        this.setState({ updateSelected: !this.state.updateSelected });
    };

    onPressed_ini = () => {
        let img = this.props.navigation.state.params.image;
        let imageID = "";

        if (img != "") {
            imageID = this.props.navigation.state.params.image;
        }

        const { data } = this.state;
        data.forEach(elem => {
            elem.toggle = false;
            if (elem.id == imageID) {
                elem.toggle = true;
            }
        });

        this.setState({ image: imageID });
        this.setState({ data: data });
        this.setState({ updateSelected: !this.state.updateSelected });
    };

    componentDidMount() {
        commonFunctions.matomoTrack('screen', 'Newchallenge');
        if (!this.props.navigation.state.params) {
            this.setState({
                title: "",
                what: "",
                notify: "",
                why: "",
                image: "",
                // sdate: new Date()
            });
        }
        this.focusListener = this.props.navigation.addListener(
            "didFocus",
            () => {
                if (this.props.navigation.state.params) {
                    this.setState({
                        title: this.props.navigation.state.params.ptitle,
                        what: 'Loading...'
                    });
                    this.setState({ update: 1 });

                    this.database = firebase.database();
                    const userId = firebase.auth().currentUser.uid;
                    firebase
                        .database()
                        .ref(
                            "/Users/" +
                            userId +
                            "/Challenge/" +
                            this.props.navigation.state.params.pkey
                        )
                        .once("value", snapshot => {
                            this.setState({
                                title: snapshot.val().title,
                                what: snapshot.val().what,
                                succesful: snapshot.val().succesful,
                                why: snapshot.val().why,
                                how: snapshot.val().how,
                                problems: snapshot.val().problems,
                                sdate: moment(snapshot.val().daystart),
                                image: snapshot.val().image,
                                mountain: snapshot.val().mountain
                            });
                        });
                    this.onPressed_ini();
                } else {
                    /*  this.setState({
                         title: "",
                         what: "",
                         notify: "",
                         why: "",
                         image: "1"
                     }); */
                }
            }
        );
    }

    updateChallenge(navigation, pkey) {

        if (this.state.sdate != '' && this.state.title != "" && this.state.what && this.state.image != "") {

            dateform = this.state.sdate;
            navigation.navigate("Create2",
                {
                    ptitle: this.state.title,
                    pwhat: this.state.what,
                    pdate: dateform,
                    picon: this.state.image,
                    psuccesful: this.state.succesful,
                    pwhy: this.state.why,
                    phow: this.state.how,
                    pproblems: this.state.problems,
                    update: 1,
                    pkey: this.props.navigation.state.params.pkey,
                    pmountain: this.state.mountain,

                });
        } else {

            Alert.alert("Challenge validation", 'Please fill the all the fields and select the icon challenge');
        }
    }

    async   deleteChallenge(navigation, pkey) {
        await FirebaseAPI.deleteChallenge(pkey);
        this.props.navigation.dispatch(StackActions.popToTop());
        //this.props.navigation.navigate("Challenges");
    }

    createChallenge(navigation) {



        if (this.state.sdate != '' && this.state.title != "" && this.state.what && this.state.image != "") {

            let dateform = moment(this.state.sdate).format("YYYY-MM-DD");
            this.state.title,
                this.state.what,
                dateform,
                this.state.image,

                navigation.navigate("Create2",
                    {
                        ptitle: this.state.title,
                        pwhat: this.state.what,
                        pdate: dateform,
                        picon: this.state.image,
                    }
                );

        } else {

            Alert.alert(translate("Challenge.validation") , translate("Challenge.fill") );
        }
    }

    renderItem = data => (
        <ChallengeImage
            id={data.id}
            onPressItem={this.onPressed}
            image={data.image}
            active={data.toggle}
        />
    );

    showTimepicker = (value) => {
        this.setState((prevState) => {
            return { showtime: true, sdate: prevState.sdate ? prevState.sdate :  new Date()}
        });
    };

    handleBack() {
        this.props.navigation.goBack();
    }

    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }

    render(): React.Node {
        const { selectedHours, selectedMinutes } = this.state;
        const minday = moment(new Date()).format('YYYY-MM-DD');

        let maxday = challengesAPI.today_plus(10);

        return (
            <BaseContainer
                title={translate("Challenge.createChallenge")}
                navigation={this.props.navigation}
                scrollable
                backBtn
            >
                <StatusBar backgroundColor="white" barStyle="dark-content" />
                <BackArrow handleBackPress={() => this.handleBack()} />
                <View style={styles.screenTitleWrapper}>
                    <Text style={styles.screenTitle}>{(this.state.update === 0) ? translate("Challenge.createChallenge") : translate("Challenge.editChallenge")}</Text>
                </View>
                <View style={Styles.form}>
                    <Field
                        displayIcon iconName="md-rocket" iconColor={COLORS.orange}
                        label={translate("Challenge.title")}
                        value={this.state.title}
                        onChangeText={text => this.setState({ title: text })}
                        labelColor={COLORS.gray}
                    />
                    <Field
                        displayIcon
                        displayIcon iconName="md-flash" iconColor={COLORS.orange}
                        label={translate("Challenge.what")}
                        value={this.state.what}
                        onChangeText={text => this.setState({ what: text })}
                        labelColor={COLORS.gray}
                        double
                    />
                    {this.state.update === 0 ? (
                        <View style={styles.dateContainer}>
                            <Icon name='ios-calendar' style={{ color: COLORS.orange, marginLeft: 5, marginRight: 18 }}></Icon>
                            <TouchableOpacity
                                onPress={() => this.showTimepicker()}
                            >
                                <View
                                    style={{
                                        borderColor: COLORS.orange,
                                        paddingTop: 3
                                    }}
                                >
                                    <Text
                                        style={{fontSize: 17,
                                            borderWidth: 0,
                                            color: COLORS.black,
                                            textAlign: "left",
                                            alignSelf: "stretch"}}
                                    >
                                        {this.state.sdate ? moment(this.state.sdate).format("YYYY-MM-DD") : translate("Challenge.start_date")}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ) : (
                            <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 10, borderBottomWidth: 2, borderColor: COLORS.lightgray }}>
                                <Icon name='ios-calendar' style={{ color: COLORS.orange, marginLeft: 5, marginRight: 15 }}></Icon>
                                <Label style={styles.fieldLabel}>{translate("Challenge.start_date")}: <Text style={styles.fieldText}>{moment(this.state.sdate).format("YYYY-MM-DD")}</Text> </Label>
                            </View>

                        )}
                    <Label style={[styles.fieldLabel, { marginTop: 10, marginBottom: 20 }]}>{translate("Challenge.icon")}</Label>
                    <FlatList
                        refresh={this.state.updateSelected}
                        numColumns={5}
                        keyExtractor={item => item.id.toString()}
                        data={this.state.data}
                        renderItem={({ item }) => this.renderItem(item)}
                        columnWrapperStyle={{ justifyContent: 'center' }}
                    />
                </View>

                <View style={styles.buttonsContainer}>
                    {this.state.update === 1 ? (
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <TouchableOpacity style={styles.infoButton} onPress={() => this.updateChallenge(this.props.navigation)}>
                                <Text style={styles.infoText}>{translate("Challenge.next")}</Text>
                                <FontAwesome5 name="arrow-circle-right" size={18} style={styles.infoIcon} />
                            </TouchableOpacity>



                        </View>
                        
                    ) : (
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <TouchableOpacity style={styles.infoButton} onPress={() => this.createChallenge(this.props.navigation)}>
                                    <Text style={styles.infoText}>{translate("Challenge.next")}</Text>
                                    <FontAwesome5 name="arrow-circle-right" size={18} style={styles.infoIcon} />
                                </TouchableOpacity>
                            </View>
                        )}
                    {this.state.update === 1 ? (
                        <View style={{ alignSelf: 'stretch', marginBottom: 20 }}>


                            <Button transparent block onPress={() =>
                                this.promptDeleteChallenge(
                                    this.props.navigation,
                                    this.props.navigation.state.params.pkey
                                )}>
                                <Text style={styles.actionText}>{translate("Challenge.delete")}</Text>
                            </Button>
                        </View>
                    ) : null}
                </View>
                {this.state.showtime && Platform.OS === "ios" ? (
                    <TimePicker
                        date={this.state.sdate ? this.state.sdate.getTime() : new Date().getTime()}
                        onChange={(time) => {
                            this.setState({ sdate: time });
                            console.log(this.state.sdate)
                        }}
                        mode={"date"}
                        onClose={(time) => {
                            this.setState({ showtime: false });
                        }}
                    />
                ) : null}
                {this.state.showtime && Platform.OS != "ios" ? (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={this.state.sdate ? this.state.sdate.getTime() : new Date().getTime()}
                        mode={"date"}
                        is24Hour={true}
                        display="default"
                        onChange={(event, value) => {
                            this.setState({ showtime: false, sdate: value });
                        }}
                    />
                ) : null}                
            </BaseContainer>
        );
    }
}

class ChallengeImage extends React.PureComponent {
    _onPress = () => {
        this.props.onPressItem(this.props.id);
    };

    render() {
        const { active } = this.props;
        const colorsel = active ? COLORS.orange : COLORS.gray;

        return (
            <View style={styles.item}>
                <TouchableOpacity onPress={this._onPress}>
                    <Image
                        style={[styles.image, { tintColor: colorsel }]}
                        resizeMode="cover"
                        source={this.props.image}
                    >
                    </Image>
                    {/*  <Text>{active ? 'Activo' : 'Inactivo'}</Text> */}
                </TouchableOpacity>
            </View>
        );
    }
}



const styles = StyleSheet.create({
    container: {
        //   marginTop: Constants.statusBarHeight
    },
    item: {
        margin: 1,
        width: 50,
        height: 50
    },
    screenTitleWrapper: {
        marginTop: 45,
        marginBottom: 15
    },
    screenTitle: {
        textAlign: 'center',
        color: COLORS.gray,
        fontSize: 20,
        fontWeight: 'bold'
    },
    paragraph: {
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
        color: "#fff"
    },
    image: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 30,
        height: 30
    },
    text: {
        color: "#fff",
        fontFamily: "Avenir-Black"
    },
    fieldLabel: {
        color: COLORS.gray,
        fontFamily: "Avenir-Book",
        marginTop: 5,
        marginRight: 10,
        fontSize: 15
    },
    fieldText: {
        color: COLORS.black,
        fontFamily: "Avenir-Book",
        marginLeft: 5,
        fontSize: 16
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 25,
        marginBottom: 5,
        borderBottomWidth: 0.9,
        borderColor: COLORS.white,
        paddingBottom: 15
    },
    buttonsContainer: {
        justifyContent: 'flex-end',
        flex: 1,
        paddingBottom: 10
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
    actionText: {
        color: COLORS.orange
    },
    infoText: {
        textAlign: 'center',
        color: COLORS.white,
        fontWeight: 'bold',
        marginRight: 10,
        fontSize: 13
    }
});
