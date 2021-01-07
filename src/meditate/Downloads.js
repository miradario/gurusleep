import * as React from "react";
import { BaseContainer } from "../components";
import { StatusBar } from "react-native";
import ListDownloads from "../components/ListDownloads";
import * as Matomo from 'react-native-matomo';
import * as commonFunctions from '../../utils/common.js';
import translate from "../../utils/language";

export default class Downloads extends React.Component<ScreenProps<>> {
    constructor() {
        super();
        this.state = {
            meditations: [],
            favourites: [],
            rerender: false,
        };
    }

    componentDidMount() {
        commonFunctions.matomoTrack('screen', 'Break'); 
        this.focusListener = this.props.navigation.addListener(
            "didFocus",
            () => {
                const reload = this.props.navigation.getParam("reload", false);
                if (reload) {
                    this.setState({ rerender: true });
                }
            }
        );
    }

    render() {
        return (
            <BaseContainer title={"Meditate"}>
                <StatusBar backgroundColor="white" barStyle="dark-content" />
                <ListDownloads
                    navigation={this.props.navigation}
                    rerender={this.state.rerender}
                ></ListDownloads>
            </BaseContainer>
        );
    }
}
