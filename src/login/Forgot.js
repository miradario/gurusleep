/// @flow
import * as React from "react";
import { StyleSheet, StatusBar, Image, View, TextInput, SafeAreaView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ImageBackground } from "react-native";
import { H1, Button, Text, Content, Icon } from "native-base";
import { Video } from 'expo-av';
import { Constants } from "expo";

import { Images, WindowDimensions, Field, Small, Styles } from "../components";
import { LinearGradient } from 'expo-linear-gradient';
import { HomeContainer } from '../components';
import COLORS from "../assets/Colors";
import { AnimatedView } from "../components/Animations";
import type { ScreenProps } from "../components/Types";
import variables from "../../native-base-theme/variables/commonColor";
import firebase from 'firebase';
import * as FirebaseAPI from '../../modules/firebaseAPI.js';
import translate from "../../utils/language";

export default class Forgot extends React.Component<ScreenProps<>> {

    constructor() {
        super();
        _isMounted = false;
        this.state = {
            email: "",
            verifying: false
        }
    }

    componentDidMount() {
        this._isMounted = true;

    }

    componentWillUnmount() {
        this._isMounted = false;
    }



    async Forgot() {
        this.setState({ verifying: true })
        console.log(this.state.email);
        await FirebaseAPI.Forgot(this.state.email);

        this.props.navigation.navigate("Login")

        if (this._isMounted) { this.setState({ verifying: false }) };
    }

    password: TextInput;


    Login = () => this.props.navigation.navigate("Login")

    render(): React.Node {
        return (
            <HomeContainer>
                <View style={styles.bgVideoWrapper}>
                    <Image
                        source={Images.web_mobile_bg}
                        style={{ width: WindowDimensions.width, height: WindowDimensions.height * 0.3 }}
                        resizeMode='cover'
                    />
                </View>
                <View style={styles.container} behavior="height">
                    <View style={{ flex: 1, alignItems: 'center', paddingLeft: 15, paddingRight: 15 }}>
                        <View style={styles.tlexLogoWrapper}><Image source={Images.tlex_orig} style={styles.tlexLogo}></Image></View>
                        <SafeAreaView style={StyleSheet.absoluteFill}>
                            <Content style={[StyleSheet.absoluteFill, styles.content]}>
                                <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={-30} style={styles.innerContent}>
                                    <AnimatedView>
                                        <Text style={styles.title}>
                                            <Text style={styles.title}>{translate("Login.forgot")}</Text>
                                            <Text style={styles.dot}>.</Text>
                                        </Text>
                                        <View style={styles.loginArea}>
                                            <View style={styles.inputContainer}>
                                                <Field
                                                    label="E-mail"
                                                    autoCapitalize="none"
                                                    returnKeyType="next"
                                                    value={this.state.email}
                                                    onChangeText={(text) => this.setState({ email: text })}
                                                    onSubmitEditing={this.goToPassword}
                                                    displayIcon
                                                    iconName="md-person"
                                                    labelColor={COLORS.gray}
                                                    iconColor={COLORS.orange}
                                                    last
                                                />

                                            </View>
                                        </View>
                                        <View>
                                            <View>
                                                <Button transparent full onPress={this.Login}>
                                                    <Small style={styles.signInText}>{translate("Meditation.back")} <Small style={[styles.signInText, { textDecorationLine: 'underline', color: COLORS.orange }]}>{translate("Login.login")}</Small></Small>
                                                </Button>
                                            </View>
                                            <View style={styles.loginContainer}>
                                                {this.state.verifying ? (
                                                    <ActivityIndicator color={COLORS.orange} />
                                                ) :
                                                    (
                                                        <TouchableOpacity style={styles.loginButton} onPress={() => this.Forgot()}>
                                                            <Text style={styles.loginText}>{translate("Login.check")}</Text>
                                                        </TouchableOpacity>
                                                    )}
                                            </View>
                                        </View>
                                    </AnimatedView>
                                </KeyboardAvoidingView>
                            </Content>
                        </SafeAreaView>
                    </View>
                </View>
            </HomeContainer>

        );
    }
}

const { height, width } = WindowDimensions;
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        width: WindowDimensions.width,
        height: WindowDimensions.width / 750 * 150,
        resizeMode: 'contain',
        flex: 1,
        position: "absolute",
        top: 0,
        zIndex: 1000
    },
    content: {
        flex: 1
    },
    innerContent: {
        paddingTop: 110
    },
    title: {
        color: COLORS.gray,
        textAlign: "left",
        fontSize: 50,
        paddingLeft: (WindowDimensions.width - 300) / 2 - 12,
        fontWeight: "bold",
        fontFamily: "Avenir-Black",
        lineHeight: 65        
    },
    dot: {
        fontSize: 70,
        color: '#f26f21'
    },
    loginButton: {
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: COLORS.orange,
        borderRadius: 15,
        width: 200,
        alignContent: 'center',
        shadowOffset: {
            width: 0, height: 1
        },
        shadowRadius: 5,
        shadowOpacity: 0.7,
        shadowColor: COLORS.black
    },
    loginContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
        marginTop: 20
    },
    loginText: {
        textAlign: 'center',
        color: COLORS.white,
        fontWeight: 'bold'
    },
    signInText: {
        textAlign: 'right',
        color: COLORS.gray,
        fontSize: 14
    },
    inputContainer: {
        width: 300,
        backgroundColor: COLORS.white,
        borderRadius: 15,
        marginTop: 25,
        borderWidth: 1,
        borderColor: COLORS.lightgray
    },
    loginArea: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -11
    },
    tlexLogoWrapper: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000
    },
    tlexLogo: {
        width: 105,
        height: 75,
        resizeMode: 'contain'
    },
    bgVideoWrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0
    },
    bgVideo: {
        position: 'absolute',
        top: -3,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
});