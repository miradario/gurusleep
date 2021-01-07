import * as React from "react";
import { BaseContainer } from "../components";
import { StatusBar, View, Text } from "react-native";
import ListMeditate from "../components/ListMeditate";
import * as Matomo from "react-native-matomo";
import * as commonFunctions from "../../utils/common.js";
import { checkInternetConnection, NetworkConsumer } from "react-native-offline";
import COLORS from "../assets/Colors";
import translate from "../../utils/language";
import { NoInternet } from "./NoInternet"

export default class Work extends React.Component<ScreenProps<>> {
    constructor() {
        super();
        this.state = {
            meditations: [],
            favourites: [],
            data: [
                {
                    id: "DesktopYoga",
                    label: "Desktop Streching",
                    icon: "md-body",
                },
                { id: "MicroMoments", label: "Micro Moments", icon: "md-body" },
            ],
            rerender: false,
            connected: true,
        };
    }

    async componentDidMount() {
        const connected = await checkInternetConnection();
        this.setState({ connected });
        commonFunctions.matomoTrack("screen", "Work");
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
            <NetworkConsumer>
                {({ isConnected }) =>
                    isConnected ? (
                        <BaseContainer title={"Mindfull @Work"}>
                            <StatusBar
                                backgroundColor="white"
                                barStyle="dark-content"
                            />
                            <ListMeditate
                                navigation={this.props.navigation}
                                cat={[
                                    "Desktop",
                                    "DesktopYoga",
                                    "MicroMoments",
                                    "Meetings",
                                ]}
                                initialCat={0}
                                rerender={this.state.rerender}
                            ></ListMeditate>
                        </BaseContainer>
                    ) : (
                        <NoInternet />
                    )
                }
            </NetworkConsumer>
        );
    }
}