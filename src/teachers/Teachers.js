import React, { Component } from "react";
import {
    StyleSheet,
    View,
    Text,
    Image,
    Dimensions,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import {
    BaseContainer,
    SectionTitle,
    WindowDimensions,
    Styles,
} from "../components";
import { getTeachers } from "../../modules/firebaseAPI";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../assets/Colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as Matomo from "react-native-matomo";
import * as commonFunctions from "../../utils/common.js";
import translate from "../../utils/language";

const urlimg =
    "https://tlexeurope.s3.eu-central-1.amazonaws.com/images/teachers/";
const CARD_WIDTH = Dimensions.get("window").width * 0.93;
const CARD_HEIGHT =
    Platform.OS === "android"
        ? Dimensions.get("window").height * 0.75
        : Dimensions.get("window").height * 0.6;
const SPACING_FOR_CARD_INSET = Dimensions.get("window").width * 0.1 - 10;
//uri: source= {urlimg + card.photo + ".png"}

export default class Teachers extends Component {
    constructor() {
        super();
        this.state = {
            scrollPosition: 0,
            maxLeft: true,
            maxRight: false,
            teachersArray: [],
            loading: true,
        };
    }

    componentDidMount() {
        commonFunctions.matomoTrack("screen", "Teachers");
        this.loadTeachers();
    }

    loadTeachers = async () => {
        const teachers = await getTeachers();
        this.setState({ teachersArray: teachers, loading: false });
    };

    _renderViews = (views: CardType[]): JSX.Element[] => {
        return views.map((card) => {
            // console.log(urlimg + card.photo + ".png")
            return (
                <View
                    key={card.key}
                    style={[
                        styles.teacherWrapper,
                        Styles.shadow,
                        { marginTop: Platform.OS === "android" ? 5 : 70 },
                    ]}
                >
                    <View style={styles.teacherPhoto}>
                        <Image
                            style={{ width: 125, height: 125 }}
                            source={{ uri: urlimg + card.photo + ".png" }}
                        />
                    </View>
                    <Text
                        style={{
                            fontSize: 17,
                            color: COLORS.orange,
                            marginTop: 10,
                            fontFamily: "Avenir-Black",
                        }}
                    >
                        {card.name}
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            color: COLORS.black,
                            marginTop: 5,
                            fontFamily: "Avenir-Black",
                        }}
                    >
                        {card.title}
                    </Text>
                    <Text
                        style={{
                            fontSize: 14,
                            color: COLORS.black,
                            marginTop: 0,
                            fontFamily: "Avenir-Book",
                        }}
                    >
                        {card.subtitle}
                    </Text>
                    <ScrollView>
                        <Text
                            style={{
                                fontSize: 13,
                                color: COLORS.black,
                                marginTop: 15,
                                fontFamily: "Avenir-Book",
                                textAlign: "center",
                            }}
                        >
                            {card.description}
                        </Text>
                    </ScrollView>
                </View>
            );
        });
    };

    onLeftPress() {
        this.myScroll.scrollTo({
            x: this.state.scrollPosition - (CARD_WIDTH + 10),
            y: 0,
            animated: true,
        });
    }

    onRightPress() {
        this.myScroll.scrollTo({
            x: this.state.scrollPosition + CARD_WIDTH + 10,
            y: 0,
            animated: true,
        });
    }

    handleScroll = (event) => {
        let maxLeft = false;
        let maxRight = false;
        if (event.nativeEvent.contentOffset.x < CARD_WIDTH + 10) {
            maxLeft = true;
        }
        if (
            event.nativeEvent.contentOffset.x >=
            (this.state.teachersArray.length - 1) * (CARD_WIDTH - 10)
        ) {
            maxRight = true;
        }
        this.setState({
            scrollPosition: event.nativeEvent.contentOffset.x,
            maxLeft: maxLeft,
            maxRight: maxRight,
        });
    };

    render() {
        const { teachersArray, maxLeft, maxRight, loading } = this.state;
        return (
            <BaseContainer webBackground>
                <SectionTitle
                    label={translate("More.teachers")}
                    iconName="ios-list"
                />
                <View
                    style={{
                        alignSelf: "center",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 10,
                    }}
                >
                    {!maxLeft && (
                        <View style={styles.leftArrowWrapper}>
                            <TouchableOpacity
                                onPress={() => this.onLeftPress()}
                            >
                                <Ionicons
                                    name={"ios-arrow-back"}
                                    style={{ color: COLORS.orange }}
                                    size={30}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                    {!maxRight && (
                        <View style={styles.rightArrowWrapper}>
                            <TouchableOpacity
                                onPress={() => this.onRightPress()}
                            >
                                <Ionicons
                                    name={"ios-arrow-forward"}
                                    style={{ color: COLORS.orange }}
                                    size={30}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                    {!loading ? (
                        <ScrollView
                            horizontal // Change the direction to horizontal
                            pagingEnabled // Enable paging
                            decelerationRate={0} // Disable deceleration
                            snapToInterval={CARD_WIDTH + 10} // Calculate the size for a card including marginLeft and marginRight
                            snapToAlignment="center" // Snap to the center
                            onScroll={this.handleScroll}
                            ref={(ref) => (this.myScroll = ref)}
                            contentInset={{
                                // iOS ONLY
                                top: 0,
                                left: SPACING_FOR_CARD_INSET, // Left spacing for the very first card
                                bottom: 0,
                                right: SPACING_FOR_CARD_INSET, // Right spacing for the very last card
                            }}
                            contentContainerStyle={{
                                // contentInset alternative for Android
                                paddingHorizontal: 0, //Platform.OS === 'android' ? SPACING_FOR_CARD_INSET : 0 // Horizontal spacing before and after the ScrollView
                            }}
                            showsHorizontalScrollIndicator={false}
                        >
                            {this._renderViews(teachersArray)}
                        </ScrollView>
                    ) : (
                        <ActivityIndicator
                            size="large"
                            color={COLORS.orange}
                        ></ActivityIndicator>
                    )}
                </View>
            </BaseContainer>
        );
    }
}

const styles = StyleSheet.create({
    teacherWrapper: {
        paddingLeft: 70,
        paddingRight: 70,
        paddingBottom: 20,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        alignItems: "center",
        backgroundColor: COLORS.lightblue,
        margin: 5,
        borderRadius: 15,
    },
    teacherPhoto: {
        borderRadius: 70,
        marginTop: Platform.OS === "android" ? 10 : -70,
        height: 140,
        width: 140,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.lightblue,
    },
    leftArrowWrapper: {
        position: "absolute",
        left: 30,
        top: 300,
        zIndex: 1000,
    },
    rightArrowWrapper: {
        position: "absolute",
        right: 30,
        top: 300,
        zIndex: 1000,
    },
});
