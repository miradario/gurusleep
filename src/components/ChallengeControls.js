import React, { Component } from "react";
import { StyleSheet, View, Dimensions, Image, Button, TouchableHighlight,  TouchableOpacity, Alert } from "react-native";
import Images from "../components/images";
import { Text } from "native-base";
import COLORS from "../assets/Colors";
import * as FirebaseAPI from "../../modules/firebaseAPI.js";    
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const img_pre = "../assets/challenges/";
const img_post = ".png";

const obj1 = {
    challenge1: require("../assets/challenges/challenge-1.png"),
    challenge2: require("../assets/challenges/challenge-2.png"),
    challenge3: require("../assets/challenges/challenge-3.png"),
    challenge4: require("../assets/challenges/challenge-4.png"),
    challenge5: require("../assets/challenges/challenge-5.png"),
    challenge6: require("../assets/challenges/challenge-6.png"),
    challenge7: require("../assets/challenges/challenge-7.png"),
    challenge8: require("../assets/challenges/challenge-8.png"),
    challenge9: require("../assets/challenges/challenge-9.png"),
    challenge10: require("../assets/challenges/challenge-10.png"),
    challenge11: require("../assets/challenges/challenge-11.png"),
    challenge12: require("../assets/challenges/challenge-12.png"),
    challenge13: require("../assets/challenges/challenge-13.png"),
    challenge14: require("../assets/challenges/challenge-14.png"),
    challenge15: require("../assets/challenges/challenge-15.png"),
    challenge16: require("../assets/challenges/challenge-16.png"),
    challenge17: require("../assets/challenges/challenge-17.png"),
    challenge18: require("../assets/challenges/challenge-18.png"),
    challenge10: require("../assets/challenges/challenge-10.png"),
    challenge11: require("../assets/challenges/challenge-11.png"),
    challenge12: require("../assets/challenges/challenge-12.png"),
    challenge13: require("../assets/challenges/challenge-13.png"),
    challenge14: require("../assets/challenges/challenge-14.png"),
    challenge15: require("../assets/challenges/challenge-15.png"),
    challenge16: require("../assets/challenges/challenge-16.png"),
    challenge17: require("../assets/challenges/challenge-17.png"),
    challenge18: require("../assets/challenges/challenge-18.png")
};

export default class ChallengeControls extends Component {
    constructor() {
        super();
        this.state = {
            barWidth: 0,
            colorbut: COLORS.orange,
            colorbutedit: COLORS.orange,
        };
    }

   
    getBarWidth = event => {
        let barWidth = event.nativeEvent.layout.width;
        this.setState({ barWidth: barWidth });
    };

    getDotPosition(daysCompleted) {
        const minPos = -2;
        const maxPos = this.state.barWidth - 15;
        let position = minPos + (daysCompleted / 21) * (maxPos - minPos);
        return position;
    }

    render() {
        const { finished, notstarted, daysCompleted, title, infoCompleted, infoAbandoned, image, navigation, onmountain, pkey } = this.props;
        let image1 = image.replace("-", "");
        let imagesrc = obj1[image1];
        this.state.colorbut = (notstarted==true ) ? COLORS.orange : COLORS.orange;
        this.state.colorbutedit = (finished==true ) ? COLORS.orange : COLORS.orange;
        this.state.colorbutbak = (notstarted==true || finished==true) ? COLORS.lightorange : COLORS.blue;
        
         return (
            <View style={[styles.indicatorContainer, {
                    backgroundColor: this.state.colorbutbak
                    }]}>
                <View style={styles.challengeLogo}>
                    <Image
                        style={[styles.image]}
                        resizeMode="cover"
                        source={imagesrc}
                    >
                    </Image>
                </View>
                <View style={styles.challengeData}>
                    <Text style={styles.challengeTitle}>{title}</Text>
                    <Text style={styles.challengeInfo}>{infoCompleted}</Text>
                    <Text style={styles.challengeInfo}>{infoAbandoned}</Text>
                    <View
                        onLayout={event => this.getBarWidth(event)}
                        style={styles.challengeBar}>
                        <View
                            style={[
                                { left: this.getDotPosition(daysCompleted) },
                                styles.challengeDot
                            ]}
                        ></View>
                        <View
                            style={[
                                { width: this.getDotPosition(daysCompleted) },
                                styles.challengeMeasure
                            ]}
                        ></View>
                    </View>
                </View>
                <View style={styles.challengeButton}>
                    <TouchableOpacity onPress={onmountain} title="" disabled = {notstarted} >
                        <View style={{ borderRadius: 20, backgroundColor: COLORS.orange, padding: 7 }}>
                            <Image style={{ height: 14, width: 14, tintColor: COLORS.white}} source={Images.arrow_right}></Image>
                        </View>
                    </TouchableOpacity>
                </View>                
            </View>
        );
    }
}

const styles = StyleSheet.create({
    indicatorContainer: {
        flexDirection: "row",
        borderRadius: 50,
        backgroundColor: COLORS.orange,
        marginTop: 20,
        borderWidth: 1,
        borderColor: COLORS.lightgray,
        shadowOffset: {
            width: 0, height: 2
        }, 
        shadowRadius: 5,
        shadowOpacity: 0.7,
        shadowColor: COLORS.gray,
        elevation: 2
    },
    challengeLogo: {
        flex: 4,
        justifyContent: "center",
        alignItems: "center"
    },
    challengeData: {
        backgroundColor: COLORS.white,
        flex: 7,
        padding: 8,
    },
    challengeButton: {
        flex: 3,
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        borderTopRightRadius: 50,
        borderBottomRightRadius: 50        
    },    
    challengeControls: {
        flexDirection: "row",
        flex: 1,
        justifyContent: "flex-start",
        paddingTop: 8
    },
    challengeControlButton: {
        marginRight: 25
    },
    challengeTitle: {
        color: COLORS.black,
        fontSize: 13,
        fontWeight: 'bold'
    },
    challengeInfo: {
        color: COLORS.black,
        fontSize: 11
    },    
    challengeBar: {
        backgroundColor: COLORS.lightgray,
        height: 14,
        borderRadius: 50,
        marginTop: 10,
        justifyContent: "center",
        paddingLeft: 7,
        paddingRight: 7
    },
    challengeMeasure: {
        backgroundColor: COLORS.black,
        height: 2,
        borderRadius: 50
    },
    challengeDot: {
        borderRadius:
            Math.round(
                Dimensions.get("window").width + Dimensions.get("window").height
            ) / 2,
        width: 8,
        height: 8,
        backgroundColor: COLORS.black,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute"
    },
    image: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 50,
        height: 50,
        tintColor: COLORS.white
    }
});
