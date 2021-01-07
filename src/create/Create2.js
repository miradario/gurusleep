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
    StatusBar
} from "react-native";
import { Button, Text, Label } from "native-base";
import { BaseContainer, Avatar, Field, Styles, BackArrow } from "../components";
import type { ScreenProps } from "../components/Types";
import Date from "./Date";
import { Constants } from "expo";
import moment from "moment";
import variables from "../../native-base-theme/variables/commonColor";
import * as FirebaseAPI from "../../modules/firebaseAPI.js";
import * as challengesAPI from "../../modules/challengesAPI.js";
import firebase from "firebase";
import DatePicker from "react-native-datepicker";
import ButtonGD from "../components/ButtonGD";
import COLORS from "../assets/Colors";
import translate from '../../utils/language';
import { StackActions } from 'react-navigation';
import * as Matomo from 'react-native-matomo';
import * as commonFunctions from '../../utils/common.js';


const { width } = Dimensions.get("window");
const height = width * 0.8;

const mountain1 = require("../assets/mountain/summer-1.png");
const mountain2 = require("../assets/mountain/winter-2.png");
const mountain3 = require("../assets/mountain/lake-3.png");

/*
const mountain1 = require("../assets/challenges/challenge-1.png");
const mountain2 = require("../assets/challenges/challenge-2.png");
const mountain3 = require("../assets/challenges/challenge-3.png");
*/
export default class Create2 extends React.PureComponent<ScreenProps<>> {
    state = {
        title: "",
        what: "",
        notify: "",
        why: "",
        update: 0,
        how: "",
        succesful: "",
        problems: "",
        icon: "",
        image: "",
        data: [
            { id: "summer", image: mountain1, toggle: false },
            { id: "winter", image: mountain2, toggle: false },
            { id: "lake", image: mountain3, toggle: false }
        ],
        loading: false
    }

    renderItem = data => (
        <ChallengeImage
            id={data.id}
            onPressItem={this.onPressed}
            image={data.image}
            active={data.toggle}
        />
    );

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
    }

    onPressed_ini = () => {
        let img = this.props.navigation.state.params.pmountain;

        if (img != "") {
            imageID = this.props.navigation.state.params.pmountain;
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
    }

    componentDidMount() {
        if (this.props.navigation.state.params.pkey) {
            this.setState({ how: 'Loading...', why: 'Loading...', problems: 'Loading...' });
        }
        this.focusListener = this.props.navigation.addListener(
            "didFocus",
            () => {
                if (this.props.navigation.state.params.pkey) {
                    this.setState({
                        title: this.props.navigation.state.params.ptitle,
                        what: this.props.navigation.state.params.pwhat,
                        succesful: this.props.navigation.state.params.psuccesful,
                        why: this.props.navigation.state.params.pwhy,
                        how: this.props.navigation.state.params.phow,
                        problems: this.props.navigation.state.params.pproblems,
                        date: this.props.navigation.state.params.pdate,
                        icon: this.props.navigation.state.params.picon,
                        image: this.props.navigation.state.params.pmountain,
                    });
                    this.setState({ update: 1 });
                } else {
                    this.setState({ update: 0, how: '', why: '', problems: '' });
                };
                this.onPressed_ini();
            })
    }

    async updateChallenge(navigation, pkey) {

        this.setState({ loading: true })
        await FirebaseAPI.updateChallenge(
            pkey,
            this.state.title,
            this.state.what,
            this.state.why,
            this.state.how,
            this.state.succesful,
            this.state.problems,
            this.state.icon,
            this.state.image,
        );
        this.setState({ loading: false });
        navigation.navigate("Challenges");
    }

    handleBack() {
        this.props.navigation.goBack();
    }

    async createChallenge(navigation) {
        this.setState({loading: true});
        this.state.title = this.props.navigation.state.params.ptitle;
        this.state.what = this.props.navigation.state.params.pwhat;
        this.state.date = this.props.navigation.state.params.pdate;
        this.state.icon = this.props.navigation.state.params.picon;

        await FirebaseAPI.createChallenge(
            this.state.title,
            this.state.what,
            this.state.why,
            this.state.how,
            this.state.succesful,
            this.state.problems,
            this.state.date,
            this.state.icon,
            this.state.image
        );

        commonFunctions.matomoTrack('challenge', 'New Challenge');

        this.setState({loading: false})
        
        this.props.navigation.dispatch(StackActions.popToTop());
        //navigation.navigate("Challenges");
    }

    render(): React.Node {
        const { selectedHours, selectedMinutes } = this.state;
        let minday = challengesAPI.today();
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
                <View style={[Styles.form, { marginTop: 62 }]}>

                    <Field
                        label={translate("Challenge.time")}
                        value={this.state.how}
                        onChangeText={text => this.setState({ how: text })}
                        labelColor={COLORS.gray}
                        double
                    />
                    <Field
                        label={translate("Challenge.why")}
                        value={this.state.why}
                        onChangeText={text => this.setState({ why: text })}
                        labelColor={COLORS.gray}
                    />
                    <Field
                        label={translate("Challenge.problems")}
                        value={this.state.problems}
                        onChangeText={text => this.setState({ problems: text })}
                        labelColor={COLORS.gray}
                        double
                    />

                </View>
                <Label style={[styles.fieldLabel, { marginTop: 20, marginBottom: 7, fontSize: 15 }]}>{translate("Challenge.mountain")}</Label>
                <View style={{ height: 135 }}>
                    <FlatList
                        refresh={this.state.updateSelected}
                        numColumns={1}
                        horizontal
                        keyExtractor={item => item.id.toString()}
                        data={this.state.data}
                        renderItem={({ item }) => this.renderItem(item)}

                    />
                </View>

                <View style={styles.buttonsContainer}>
                    {this.state.update === 1 ? (
                        <ButtonGD title={translate("Challenge.update")} onpress={() =>
                            this.updateChallenge(
                                this.props.navigation,
                                this.props.navigation.state.params.pkey
                            )
                        } />
                    ) : (
                            <ButtonGD title={translate("Challenge.add")} onpress={() =>
                                this.createChallenge(this.props.navigation)
                            } />
                        )}
                    {/*  {this.state.update === 1 ? (
                        <ButtonGD title="Delete" onpress={() =>
                            this.deleteChallenge(
                                this.props.navigation,
                                this.props.navigation.state.params.pkey
                            )} />
                    ) : null} */}
                </View>
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
        const colorsel = active ? COLORS.orange : COLORS.white;
        return (
            <View style={styles.item}>
                <TouchableOpacity onPress={this._onPress}>
                    <Image
                        style={[styles.image, { borderColor: colorsel }]}
                        resizeMode="cover"
                        source={this.props.image}
                    >
                    </Image>
                    <Text>Lake</Text>
                    <Text>{active ? 'Activo' : 'Inactivo'}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        //  marginTop: Constants.statusBarHeight
    },
    item: {
        margin: 8,
        width: 95,
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
        width: 95,
        height: 95,
        padding: 7,
        borderRadius: 50 / 2,
        overflow: "hidden",
        borderWidth: 3,

    },
    text: {
        color: "#fff",
        fontFamily: "Avenir-Black"
    },
    fieldLabel: {
        color: COLORS.gray,
        fontFamily: "Avenir-Book",
        marginTop: 10,
        marginLeft: 40
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 50,
        marginBottom: 5
    },
    buttonsContainer: {
        paddingBottom: 5,
        flex: 1,
    }
});