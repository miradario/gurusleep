import React from "react";
import { View, TouchableOpacity, Platform, Text, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import COLORS from "../assets/Colors";

export default class TimePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: new Date(this.props.date),
            mode: this.props.mode,
        };
    }

    render() {
        const { onClose, onChange } = this.props;
        const { date, mode} = this.state;
        return (
            <View style={styles.container} onPress={onClose}>
                {Platform.OS === "ios" && (
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={{color: COLORS.orange}}>Done</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <DateTimePicker
                    value={date}
                    style={{ width: '100%', backgroundColor: 'white' }}
                    testID="dateTimePicker"
                    mode={mode}
                    is24Hour={true}
                    display="spinner"
                    onChange={(e, d) => {
                        if (Platform.OS === "ios") {
                            this.setState({ date: d });
                            onChange(d);
                        } else {
                            onClose(d);
                        }
                    }}
                    style={{ backgroundColor: "white" }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Platform.OS === "ios" ? "#00000066" : "transparent",
        position: "absolute",
        justifyContent: "flex-end",
        left: 0,
        right: 0,
        bottom: 0,
        top: 0
    },
    header: {
        alignSelf: "stretch",
        padding: 16,
        justifyContent: "flex-end",
        alignItems: "flex-end",
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderColor: "grey",
    },
});
