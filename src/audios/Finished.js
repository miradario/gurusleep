import * as React from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StatusBar,
} from "react-native";
import { Button, Icon, Text } from "native-base";
import { BaseContainer, Styles, SectionTitle, BackArrow } from "../components";
import type { ScreenProps } from "../components/Types";
import { StackActions } from "react-navigation";
import { FontAwesome5 } from "@expo/vector-icons";
import variables from "../../native-base-theme/variables/commonColor";
import firebase from "firebase";
import COLORS from "../assets/Colors";
import * as FirebaseAPI from "../../modules/firebaseAPI.js";
import translate from "../../utils/language";

const logoTick = require("../../assets/images/check_icon.png");

export default class Finished extends React.PureComponent<ScreenProps<>> {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            mounted: true,
            sutras: [],
            sutra: "",
        };
    }

    async componentDidMount() {
        let i;
        const sutras = await FirebaseAPI.getSutras();
        i = Math.floor(Math.random() * sutras.length - 1) + 0;

        this.setState({ mounted: true, sutra: sutras[i].description });
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    handleGoHome() {
        this.props.navigation.dispatch(StackActions.popToTop());
    }

    render(): React.Node {
        const { navigation } = this.props;
        const photo = navigation.getParam("photo", "");
        const category = this.props.navigation.getParam(
            "category",
            "midnfullness"
        );
        return (
            <BaseContainer
                title="Meditate"
                navigation={this.props.navigation}
                backBtn
                noPadding
            >
                <View style={style.container}>
                    <View style={style.imgWrapper}>
                        <View style={style.imgOverlay} />
                        <Image source={{ uri: photo }} style={style.img} />
                    </View>
                    <View
                        style={{
                            ...StyleSheet.absoluteFillObject,
                            zIndex: 3000,
                        }}
                    >
                        <Text style={style.audioTitle}>
                            {this.capitalize(
                                this.props.navigation.state.params.ptitle
                            )}
                        </Text>
                        {/* <View style={{ marginTop: 50, textAlign: 'center', alignSelf: 'center', width: 260 }}>
              <Text style={{ fontWeight: '900', fontSize: 22, textAlign: 'center' }}>{this.state.sutra}</Text>
            </View> */}
                        <View style={style.playButtonWrapper}>
                            <TouchableOpacity
                                onPress={() => this.handleGoHome()}
                            >
                                <View style={style.playButton}>
                                    <Image
                                        style={style.tickIconImg}
                                        source={logoTick}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View
                            style={{
                                marginTop: 20,
                                textAlign: "center",
                                alignSelf: "center",
                                width: 210,
                            }}
                        >
                            {this.props.navigation.state.params.elapsed > 5 && (
                                <Text
                                    style={{
                                        fontWeight: "900",
                                        fontSize: 17,
                                        textAlign: "center",
                                    }}
                                >
                                    {" "}
                                    {translate("Meditation.congrats")}
                                </Text>
                            )}
                            <Text
                                style={{
                                    fontWeight: "600",
                                    fontSize: 16,
                                    textAlign: "center",
                                    marginTop: 10,
                                }}
                            >
                                {" "}
                                {translate("Meditation.congrats")}{" "}
                                {this.props.navigation.state.params.elapsed}{" "}
                                {translate("Meditation.of_mindfulness")}
                            </Text>
                        </View>
                        <View style={{ marginTop: 40, alignItems: "center" }}>
                            <TouchableOpacity
                                style={style.infoButton}
                                onPress={() => this.handleGoHome()}
                            >
                                <Text style={style.infoText}>
                                    {translate("Meditation.back")} {category}
                                </Text>
                                <FontAwesome5
                                    name="arrow-circle-right"
                                    size={18}
                                    style={style.infoIcon}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </BaseContainer>
        );
    }
}

const style = StyleSheet.create({
    audioTitle: {
        marginTop: 25,
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: COLORS.white,
    },
    container: {
        flex: 4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    imgWrapper: {
        alignSelf: "stretch",
        flex: 1,
    },
    img: {
        resizeMode: "cover",
        ...StyleSheet.absoluteFillObject,
    },
    imgOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        zIndex: 2000,
    },
    btnFavWrapper: {
        position: "absolute",
        zIndex: 1000,
        top: 15,
        right: 15,
    },
    playButtonWrapper: {
        alignSelf: "center",
        alignItems: "center",
        marginTop: 20,
    },
    playButton: {
        height: 82,
        width: 82,
        borderRadius: 90,
        borderColor: COLORS.white,
        borderWidth: 2,
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: 3,
    },
    tickIconImg: {
        height: 37,
        width: 37,
    },
    row: {
        justifyContent: "center",
        alignItems: "center",
        padding: variables.contentPadding * 2,
    },
    indicator: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    section: {
        padding: variables.contentPadding * 2,
        borderBottomWidth: variables.borderWidth,
        borderColor: variables.listBorderColor,
        flexDirection: "row",
        alignItems: "center",
    },
    infoIcon: {
        color: "#ffffff",
    },
    infoButton: {
        marginTop: 10,
        padding: 7,
        backgroundColor: COLORS.orange,
        borderRadius: 25,
        minWidth: 190,
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "center",
    },
    infoText: {
        textAlign: "center",
        color: COLORS.white,
        fontWeight: "bold",
        paddingLeft: 5,
        paddingRight: 5,

        marginRight: 10,
        fontSize: 13,
    },
    infoIcon: {
        color: "#ffffff",
    },
});
