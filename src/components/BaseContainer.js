// @flow
import * as React from "react";
import { StyleSheet, Image, StatusBar, View } from "react-native";
import { Button, Header as NBHeader, Left, Body, Title, Right, Icon, Content } from "native-base";
import { Video } from 'expo-av';
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from "./Avatar";
import Images from "./images";
import WindowDimensions from "./WindowDimensions";
import Container from "./Container";
import type { NavigationProps, ChildrenProps } from "./Types";
import COLORS from "../assets/Colors";

const { height, width } = WindowDimensions

// import variables from "../../native-base-theme/variables/commonColor";
type BaseContainerProps = NavigationProps<> & ChildrenProps & {
    title: string | React.Node
};

export default class BaseContainer extends React.PureComponent<BaseContainerProps> {
    render(): React.Node {
        const { navigation, backBtn, scrollable, noPadding, webBackground } = this.props;
        const showBackButton = (backBtn ? true : false)
        const scrollableContent = <Content contentContainerStyle={{ flexGrow: 1, paddingLeft: noPadding ? 0 : 10, paddingRight: noPadding ? 0 : 10 }}>
            {this.props.children}
        </Content>
        const noScrollableContent = <View style={{ flex: 1, paddingLeft: noPadding ? 0 : 10, paddingRight: noPadding ? 0 : 10 }}>{this.props.children}</View>

        return (
            <Container safe>
                {webBackground ? (
                <View style={style.bgVideoWrapper}>
                    <Image
                        source={Images.web_mobile_bg}
                        style={{width: WindowDimensions.width, height: WindowDimensions. height * 0.3}}
                        resizeMode= 'cover'
                    />
                    {/* <Video
                        source={Images.web_bg}
                        style={style.bgVideo}
                        rate={1}
                        shouldPlay={true}
                        isLooping={true}
                        volume={1}
                        muted={true}
                        resizeMode="cover"
                    /> */}
                </View>) : null}
                <View style={style.gradientBg}>
                    {scrollable ? scrollableContent : noScrollableContent}
                </View>
            </Container>
        );
    }
}

const style = StyleSheet.create({
    img: {
        width: WindowDimensions.width,
        height: WindowDimensions.height, //lo oculto para el que funcione con el s10 - Constants.statusBarHeight,
        // top: Constants.statusBarHeight
    },
    gradientBg: {
        flex: 1,
        alignItems: 'stretch',
        borderRadius: 0
    },
    right: {
        alignItems: "center"
    },
    icon: {
        fontSize: 32
    },
    largeIcon: {
        fontSize: 64,
        height: 64
    },
    imgHeader: {
        width: width,
        height: width / 750 * 150,
        position: "absolute",
        top: 0,
        resizeMode: 'contain'
    },
    header: {
        backgroundColor: COLORS.white
    },
    title: {
        color: COLORS.gray
    },
    bgVideoWrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
    bgVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0
      },    
    bgImage: {
        height: WindowDimensions.height / 3,
        resizeMode: 'cover'
    }
});
