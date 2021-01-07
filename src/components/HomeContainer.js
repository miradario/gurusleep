// @flow
import * as React from "react";
import { StyleSheet, Image, View, StatusBar} from "react-native";
import { Button, Header as NBHeader, Left, Body, Title, Right, Icon, Content } from "native-base";
import { EvilIcons } from "@expo/vector-icons";
import Constants from "expo-constants";

import Avatar from "./Avatar";
import Images from "./images";
import WindowDimensions from "./WindowDimensions";
import Container from "./Container";
import Footer from "./Footer";
import type { NavigationProps, ChildrenProps } from "./Types";


// import variables from "../../native-base-theme/variables/commonColor";
type HomeContainerProps = NavigationProps<> & ChildrenProps & {
    title: string | React.Node
};

export default class HomeContainer extends React.PureComponent<HomeContainerProps> {
    render(): React.Node {
        const { title, navigation, bottom} = this.props;
        return (
            <Container safe>
                <StatusBar backgroundColor="white" barStyle="dark-content" />
                <View style={{borderRadius: 0, flex: 1, overflow: 'hidden', minHeight: WindowDimensions.height*0.8}}>
                    {/* <Content contentContainerStyle={{ flexGrow: 1 }}> */}
                        {this.props.children}
                    {/* </Content> */}
                </View>
            </Container>
        );
    }
}

const style = StyleSheet.create({
    img: {
        width: WindowDimensions.width,
        height: WindowDimensions.height, //lo oculto para el que funcione con el s10 - Constants.statusBarHeight,
     //   top: Constants.statusBarHeight
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
    header: {
        width: WindowDimensions.width,
        position: "absolute",
        top: 0
    },
});
