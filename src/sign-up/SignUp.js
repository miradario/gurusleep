import * as React from "react";
import {
    View,
    Image,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Switch,
    Linking,
} from "react-native";
import { Button, Text, Content, Label, ListItem, Icon } from "native-base";
import { Video } from "expo-av";
import { Constants } from "expo";
import {
    Container,
    Images,
    Field,
    Styles,
    SingleChoice,
    WindowDimensions,
    Small,
} from "../components";
import { Ionicons } from "@expo/vector-icons";
import type { ScreenProps } from "../components/Types";
import { LinearGradient } from "expo-linear-gradient";
import { HomeContainer } from "../components";
import CheckBox from "@react-native-community/checkbox";
import COLORS from "../assets/Colors";
import variables from "../../native-base-theme/variables/commonColor";
import * as FirebaseAPI from "../../modules/firebaseAPI.js";
import firebase from "firebase";
import translate from "../../utils/language";
import i18n from "i18n-js";
import * as localVariables from "../../utils/localVariables.js";
import AsyncStorage from "@react-native-community/async-storage";

const ger = require("../assets/flags/germany.png");
const eng = require("../assets/flags/england.png");

export default class SignUp extends React.Component<ScreenProps<>> {
    state = {
        name: "",
        user: "",
        password: "",
        company: "",
        validcompany: true,
        language: "EN",
        verifying: false,
        work_av: false,
        work_av_color: COLORS.lightgray,
        optOutValue: false,
        workshop: [],
        data: [
            { id: "en", image: eng, toggle: false },
            { id: "ge", image: ger, toggle: false },
        ],
    };
    name: TextInput;
    email: TextInput;
    password: TextInput;
    company: TextInput;
    actualusers: 0;

    setnameRef = (input: TextInput) => (this.name = input._root);
    goToname = () => this.name.focus();
    setEmailRef = (input: TextInput) => (this.email = input._root);
    goToEmail = () => this.email.focus();
    setPasswordRef = (input: TextInput) => (this.password = input._root);
    goToPassword = () => this.password.focus();
    back = () => this.props.navigation.navigate("Login");
    componentDidMount() {
        this.watchAuthState(this.props.navigation, this.GotoWalkthrough);
    }

    GotoWalkthrough = () => {
        console.log("this.state.company gotow");
        console.log(this.state.company);
        this.props.navigation.navigate("Walkthrough", {
            workshop: this.state.company,
        });
    };

    watchAuthState = (navigation, GotoWalkthrough) => {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                console.log("corrio");
                GotoWalkthrough();
            }
        });
    };

    Workshopav() {
        if (!this.state.work_av) {
            this.setState({ work_av_color: COLORS.orange });
        } else {
            this.setState({
                work_av_color: COLORS.lightgray,
                company: "",
                validcompany: true,
            });
        }
        this.setState({ work_av: !this.state.work_av });
    }

    toggleOptOut = async (value) => {
        if (value) {
            this.setState({ optOutValue: true });
        } else {
            this.setState({ optOutValue: false });
        }
    };

    onPressed = (imageID) => {
        const { data } = this.state;
        data.forEach((elem) => {
            elem.toggle = false;
            if (elem.id == imageID) {
                elem.toggle = true;
            }
        });

        this.setState({ data: data });
        this.setState({ updateSelected: !this.state.updateSelected });
        i18n.locale = imageID;
        this.state.language = imageID;
    };

    renderItem = (data) => (
        <FlagImage
            id={data.id}
            onPressItem={this.onPressed}
            image={data.image}
            active={data.toggle}
        />
    );

    async createUser() {
      
     //validate workshop
      const INACTIVE=2;
      const WORKSHOP_OK=1;
      const WORKSHOP_INVALID=0;

    // count users.
        const INVALID=2;
        const OK=1;
        const EXCEDED=0;

        //opcional
        this.setState({ verifying: true });
        this.setState({ validcompany: true });

        if (this.state.work_av) {
            this.setState({
                validcode: await FirebaseAPI.validateworkshop(
                    this.state.company
                ),
            });

            switch(this.state.validcode) {
 
             case WORKSHOP_OK:
                const validateCount = await FirebaseAPI.validateWorkshopCountUsers(this.state.company);
                
                if (validateCount==EXCEDED) {
                    this.setState({ verifying: false });
                     Alert.alert(translate("Signup.limit"));
                    this.setState({ validcompany: false });
                }else{
                    this.setState({ validcompany: true });
                }

                
                break;
            case INACTIVE:
                     this.setState({ verifying: false });
                    Alert.alert(
                    'Workshop is Inactive',
                    'The workshop is not active',
                    [
                        
                        
                        { text: 'OK', onPress: () => console.log('Ok') }
                    ],
                    { cancelable: false }
                    );
                     this.setState({ validcompany: false });
                    break;
             case WORKSHOP_INVALID:  
                 this.setState({ verifying: false });      
                 Alert.alert(translate("Signup.workshop_code"));
                  this.setState({ validcompany: false });
             break;
            }


        } else {
            console.log("entro sin workshop");
        }

        if (this.state.validcompany == true  ) {
            this.storeLanguage(this.state.language);
            FirebaseAPI.createUser(
                this.state.name,
                this.state.company,
                this.state.language,
                this.state.user,
                this.state.password,
                this.state.optOutValue
            );
            this.setState({ verifying: false });
        } 
        
    }

    storeLanguage = async (lang) => {
        i18n.locale = lang;
        try {
            await AsyncStorage.setItem("language", lang);
        } catch (error) {
            // Error saving data
        }
    };

    render(): React.Node {
        return (
            <HomeContainer bottom={10}>
                <View style={style.bgVideoWrapper}>
                    <Image
                        source={Images.web_mobile_bg}
                        style={{
                            width: WindowDimensions.width,
                            height: WindowDimensions.height * 0.3,
                        }}
                        resizeMode="cover"
                    />
                </View>
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        paddingLeft: 15,
                        paddingRight: 15,
                    }}
                >
                    <Content style={Styles.flexGrow}>
                        <View style={style.form}>
                            <Text style={style.title}>
                                <Text style={style.title}>
                                    {translate("Signup.signup")}
                                </Text>
                                <Text style={style.dot}>.</Text>
                            </Text>
                            <View style={style.loginArea}>
                                <View style={style.inputContainer}>
                                    <Field
                                        label={translate("Signup.name")}
                                        value={this.state.name}
                                        onChangeText={(text) =>
                                            this.setState({ name: text })
                                        }
                                        onSubmitEditing={this.goToEmail}
                                        returnKeyType="next"
                                        displayIcon
                                        iconName="md-person"
                                        labelColor={COLORS.gray}
                                        iconColor={COLORS.orange}
                                    />
                                    <Field
                                        label={translate("Signup.email")}
                                        value={this.state.user}
                                        textInputRef={this.setEmailRef}
                                        onChangeText={(text) =>
                                            this.setState({ user: text })
                                        }
                                        onSubmitEditing={this.goToPassword}
                                        returnKeyType="next"
                                        displayIcon
                                        iconName="md-mail"
                                        labelColor={COLORS.gray}
                                        iconColor={COLORS.orange}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                    <Field
                                        label={translate("Signup.password")}
                                        secureTextEntry
                                        textInputRef={this.setPasswordRef}
                                        onChangeText={(text) =>
                                            this.setState({ password: text })
                                        }
                                        value={this.state.password}
                                        onSubmitEditing={() =>
                                            this.createUser()
                                        }
                                        returnKeyType="go"
                                        displayIcon
                                        iconName="md-lock"
                                        labelColor={COLORS.gray}
                                        iconColor={COLORS.orange}
                                    />

                                    <View
                                        style={{
                                            flexDirection: "row",
                                            paddingTop: 10,
                                            marginLeft: 6,
                                            paddingBottom: 10,
                                        }}
                                    >
                                        <Icon
                                            name="ios-chatbubbles"
                                            style={{
                                                color: COLORS.orange,
                                                marginLeft: 5,
                                                marginRight: 15,
                                            }}
                                        ></Icon>
                                        <Label style={style.fieldLabel}>
                                            {translate("Signup.language")}
                                        </Label>
                                    </View>

                                    <View
                                        style={{
                                            marginLeft: 0,
                                            marginBottom: 10,
                                            borderBottomWidth: 2,
                                            borderColor: COLORS.lightgray,
                                        }}
                                    >
                                        <FlatList
                                            style={{ marginLeft: 40 }}
                                            refresh={this.state.updateSelected}
                                            horizontal
                                            keyExtractor={(item) =>
                                                item.id.toString()
                                            }
                                            data={this.state.data}
                                            renderItem={({ item }) =>
                                                this.renderItem(item)
                                            }
                                        />
                                    </View>
                                    <View
                                        style={[
                                            style.labelWrapper,
                                            {
                                                paddingTop: 15,
                                                paddingBottom: 15,
                                            },
                                        ]}
                                    >
                                        <Switch
                                            value={this.state.work_av}
                                            onValueChange={(v) => {
                                                this.Workshopav();
                                            }}
                                            trackColor={{
                                                false: COLORS.lightgray,
                                                true: COLORS.orange,
                                            }}
                                        />
                                        <Label style={style.fieldExplanation}>
                                            {translate("Signup.workshop")}
                                        </Label>
                                    </View>
                                    {this.state.work_av && (
                                        <Field
                                            label={translate(
                                                "Signup.enterWorkshop"
                                            )}
                                            textInputRef={this.company}
                                            displayIcon
                                            last
                                            iconColor={COLORS.white}
                                            value={this.state.company}
                                            labelColor={COLORS.white}
                                            onChangeText={(text) =>
                                                this.setState({ company: text })
                                            }
                                            iconName="md-briefcase"
                                            labelColor={COLORS.gray}
                                            iconColor={this.state.work_av_color}
                                            disabled={!this.state.work_av}
                                        />
                                    )}
                                </View>
                                <View>
                                    <Button
                                        transparent
                                        full
                                        onPress={this.back}
                                    >
                                        <Small style={style.signInText}>
                                            {translate("Signup.already")}{" "}
                                            <Small
                                                style={[
                                                    style.signInText,
                                                    {
                                                        textDecorationLine:
                                                            "underline",
                                                        color: COLORS.orange,
                                                    },
                                                ]}
                                            >
                                                {translate("Signup.login")}
                                            </Small>
                                        </Small>
                                    </Button>
                                </View>
                            </View>

                            <View style={style.loginContainer}>
                                {this.state.verifying ? (
                                    <ActivityIndicator
                                        color={COLORS.orange}
                                        style={{ marginTop: 25 }}
                                    />
                                ) : (
                                    <TouchableOpacity
                                        style={style.loginButton}
                                        onPress={() => this.createUser()}
                                    >
                                        <Text style={style.loginText}>
                                            {translate("Signup.signup")}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View
                                style={[
                                    style.labelWrapper,
                                    {
                                        paddingTop: 40,
                                        paddingBottom: 0,
                                        flexDirection: "row",
                                        justifyContent: "center",
                                    },
                                ]}
                            >
                                <CheckBox
                                    disabled={false}
                                    value={this.state.optOutValue}
                                    onValueChange={(newValue) =>
                                        this.toggleOptOut(newValue)
                                    }
                                    boxType="square"
                                    onCheckColor={COLORS.orange}
                                    onTintColor={COLORS.orange}
                                    tintColor={COLORS.lightgray}
                                />
                                <Text
                                    style={{
                                        color: COLORS.gray,
                                        marginLeft: 15,
                                        fontSize: 10,
                                    }}
                                >
                                    {translate("Settings.stopanalytics")}
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => {
                                    Linking.openURL(
                                        "https://selfawareness-and-mindfulness.com/privacy-policy"
                                    );
                                }}
                            >
                                <Text style={style.disclaimer}>
                                    {translate("Signup.signin")}{" "}
                                    <Text
                                        style={[
                                            { textDecorationLine: "underline" },
                                            style.disclaimer,
                                        ]}
                                    >
                                        {translate("Signup.terms")}
                                    </Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Content>
                </View>
            </HomeContainer>
        );
    }
}

class FlagImage extends React.PureComponent {
    _onPress = () => {
        this.props.onPressItem(this.props.id);
    };

    render() {
        const { active } = this.props;
        const colorsel = active ? 1 : 0;

        return (
            <View style={style.item}>
                <TouchableOpacity onPress={this._onPress}>
                    <Image
                        style={[style.image, { borderWidth: colorsel }]}
                        resizeMode="cover"
                        source={this.props.image}
                    ></Image>

                    {/*  <Text>{active ? 'Activo' : 'Inactivo'}</Text> */}
                </TouchableOpacity>
            </View>
        );
    }
}

const style = StyleSheet.create({
    img: {
        ...StyleSheet.absoluteFillObject,
        width: WindowDimensions.width,
        height: WindowDimensions.height,
        //top: Constants.statusBarHeight
    },
    header: {
        width: WindowDimensions.width,
        height: (WindowDimensions.width / 750) * 150,
        resizeMode: "contain",
        flex: 1,
        position: "absolute",
        top: 0,
        zIndex: 1000,
    },
    row: {
        flexDirection: "row",
    },
    form: {
        paddingTop: 15,
    },
    disclaimer: {
        fontFamily: "Avenir-Book",
        color: COLORS.gray,
        fontSize: 14,
        width: 220,
        textAlign: "center",
        marginTop: 35,
        alignSelf: "center",
    },
    btn: {
        flex: 1,
        margin: 0,
        borderRadius: 0,
        justifyContent: "center",
        alignItems: "center",
        height: 125,
        flexDirection: "column",
    },
    icon: {
        color: "white",
        marginRight: 5,
    },
    title: {
        color: COLORS.gray,
        textAlign: "left",
        fontSize: 50,
        fontWeight: "bold",
        fontFamily: "Avenir-Black",
    },
    dot: {
        fontSize: 70,
        color: "#f26f21",
    },
    loginButton: {
        paddingTop: 15,
        paddingBottom: 15,
        backgroundColor: "#f26f21",
        borderRadius: 25,
        width: 200,
        alignContent: "center",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 5,
        shadowOpacity: 0.7,
        shadowColor: COLORS.black,
    },
    loginContainer: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        height: 50,
        marginTop: 25,
    },
    loginText: {
        textAlign: "center",
    },
    signInText: {
        color: COLORS.gray,
        fontSize: 14,
    },
    inputContainer: {
        width: 300,
        borderColor: COLORS.lightgray,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderRadius: 15,
        marginTop: 25,
    },
    loginArea: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        marginTop: -11,
    },
    labelWrapper: {
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 10,
    },

    item: {
        margin: 1,
        width: 70,
    },
    fieldExplanation: {
        color: COLORS.gray,
        fontSize: 14,
        marginLeft: 10,
    },
    fieldLabel: {
        color: COLORS.gray,
        fontFamily: "Avenir-Book",
        marginTop: 5,
        marginRight: 10,
        fontSize: 15,
    },
    image: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 50,
        height: 50,
        borderColor: COLORS.orange,
    },
    bgVideoWrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    bgVideo: {
        position: "absolute",
        top: -3,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
});
