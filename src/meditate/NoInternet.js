import * as React from "react";
import { StatusBar, View, Text } from "react-native";
import { BaseContainer } from "../components";
import COLORS from "../assets/Colors";
import translate from "../../utils/language";

export const NoInternet = () => (
    <BaseContainer title={"Breath"}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <View style={{ marginTop: 10, padding: 30, alignContent: "center" }}>
            <Text
                style={{
                    color: COLORS.gray,
                    fontSize: 15,
                    textAlign: "center",
                }}
            >
                {translate("Mindfulness.nointernet")}
            </Text>
        </View>
    </BaseContainer>
);