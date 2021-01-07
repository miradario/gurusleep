// @flow
import * as React from "react";
import {View, Image, StyleSheet} from "react-native";
import {Images, SplashContainer} from "../components";
import type { ScreenProps } from "../components/Types";
import WindowDimensions from "../components/WindowDimensions"

export default class Splash extends React.PureComponent<ScreenProps<>> {

    componentDidMount() {
        setTimeout(() => {
            this.props.navigation.navigate('Login')
          }, 2500)
    }

    render(): React.Node {
        return (
            <SplashContainer>
                <Image source={Images.splash} style={style.splashImg} />
            </SplashContainer>
        );
    }
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },  
    splashImg: {
        flex: 1,
        resizeMode: 'cover',
        width: WindowDimensions.width - 30,
        height: WindowDimensions.height - 200
    },
});
