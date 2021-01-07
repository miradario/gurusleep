import * as React from "react";
import { BaseContainer } from "../components";
import { StatusBar, ActivityIndicator, View, Text } from "react-native";
import ListMeditate from "../components/ListMeditate";
import * as FirebaseAPI from "../../modules/firebaseAPI.js";
import COLORS from "../assets/Colors";
import * as Matomo from "react-native-matomo";
import * as commonFunctions from "../../utils/common.js";
import { checkInternetConnection, NetworkConsumer} from "react-native-offline";
import translate from "../../utils/language";
import { NoInternet } from "./NoInternet"

export default class Breath extends React.Component<ScreenProps<>> {
    constructor() {
        super();
        this.state = {
            meditations: [],
            favourites: [],
            loading: true,
            workshopSKY: [],
            rerender: false,
            connected: true,
        };
    }

    async componentDidMount() {
        const connected = await checkInternetConnection();
        this.setState({ connected });
        commonFunctions.matomoTrack("screen", "Breath");
        this.focusListener = this.props.navigation.addListener(
            "didFocus",
            () => {
                const reload = this.props.navigation.getParam("reload", false);
                if (reload) {
                    this.setState({ rerender: true });
                }
            }
        );
        const dataObj = await FirebaseAPI.getUser();
        let workshopcode = dataObj.workshopcode;
         this.setState({
            workshopSKY: await FirebaseAPI.getWorkshop(workshopcode),
        });
        let breath = this.state.workshopSKY["breath"]; 
        if (breath == "yes") {
            this.setState({ meditations: ["BreathPublic", "BreathPrivate"] });
        } else {
            this.setState({ meditations: ["BreathPublic"] });
        }
        this.setState({ loading: false });
    }

    render() {
        return (
            <NetworkConsumer>
                {({ isConnected }) =>
                    isConnected ? (
                        <BaseContainer title={"Breath"}>
                            <StatusBar
                                backgroundColor="white"
                                barStyle="dark-content"
                            />
                            {!this.state.loading ? (
                                <ListMeditate
                                    navigation={this.props.navigation}
                                    cat={this.state.meditations}
                                    initialCat={0}
                                    rerender={this.state.rerender}
                                ></ListMeditate>
                            ) : (
                                <ActivityIndicator
                                    size="large"
                                    color={COLORS.orange}
                                ></ActivityIndicator>
                            )}
                        </BaseContainer>
                    ) : (
                        <NoInternet />
                    )
                }
            </NetworkConsumer>
        );
    }
}