// @flow
import * as React from "react";
import { StyleSheet, View} from "react-native";
import { Button, Header as NBHeader, Left, Body, Title, Right, Icon, Content } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from "./Avatar";
import Images from "./images";
import WindowDimensions from "./WindowDimensions";
import Container from "./Container";
import Footer from "./Footer";
import type { NavigationProps, ChildrenProps } from "./Types";
import COLORS from "../assets/Colors";

const { height, width } = WindowDimensions
type SplashContainerProps = NavigationProps<> & ChildrenProps & {
    title: string | React.Node
};

export default class SplashContainer extends React.PureComponent<SplashContainerProps> {
    render(): React.Node {
        const { title, navigation, endGradient, startGradient, backBtn } = this.props;
        const showBackButton = (backBtn ? true : false)
        return (
            <Container safe>
                <View style={style.gradientBg}>
                    <Content contentContainerStyle={{ flexGrow: 1 }}>
                        {this.props.children}
                    </Content>
                </View>
            </Container>
        );
    }
}

const style = StyleSheet.create({
    gradientBg: {
        flex: 1,
        alignItems: 'center',
        borderRadius: 40,
        overflow: 'hidden',
        margin: 15
    }
});
