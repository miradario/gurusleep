import * as React from "react";
import { BaseContainer } from "../components";
import { StatusBar } from "react-native";
import ListMeditate from "../components/ListMeditate";
import * as Matomo from "react-native-matomo";
import * as commonFunctions from '../../utils/common.js';

export default class Music extends React.Component<ScreenProps<>> {
    constructor() {
        super();
        this.state = {
            meditations: [],
            favourites: [],
        };
    }

    async componentDidMount() { 
        commonFunctions.matomoTrack('screen', 'Sleep');
    }

    render() {
        return (
            <BaseContainer title={"Meditate"}>
                <StatusBar backgroundColor="white" barStyle="dark-content" />
                <ListMeditate
                    navigation={this.props.navigation}
                    cat={["Mindfulness", "Sleep", "Music", "Walk"]}
                    initialCat={2}
                ></ListMeditate>
            </BaseContainer>
        );
    }
}
