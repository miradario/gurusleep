// @flow
import * as _ from "lodash";
import * as React from "react";
import {StyleSheet, View} from "react-native";
import type TextInput from "native-base";
import {ListItem, Item, Label, Input, Body, Right, Icon} from "native-base";
import COLORS from "../assets/Colors";

type FieldProps = {
    label: string,
    defaultValue?: string,
    last?: boolean,
    inverse?: boolean,
    right?: () => React.Node,
    textInputRef?: TextInput => void,
    children?: React.Node,
    iconName?: string,
    displayIcon?: boolean,
    labelColor: string
};

type FieldState = {
    value: string
};

export default class Field extends React.Component<FieldProps, FieldState> {

    state = {
        value: ""
    };

    componentDidMount() {
        this.setValue(this.props.defaultValue || "");
    }

    setValue = (value: string) => this.setState({ value })

    render(): React.Node {
        const {label, last, inverse, defaultValue, right, textInputRef, children, iconName, displayIcon, labelColor, iconColor, double} = this.props;
        const {value} = this.state;
        const style = inverse ? { color: "white", paddingLeft: 15} : {color: COLORS.black};
        const doubleLine = double ? { marginTop: 30} : {marginTop: 0};
        const itemStyle = inverse ? { borderColor: COLORS.lightgray} : {borderColor: COLORS.lightgray};
        const itemBorder = last ?  {} : { borderBottomWidth: 1.5};
        const keysToFilter = ["right", "defaultValue", "inverse", "label", "last"];
        const props = _.pickBy(this.props, (v, key) => keysToFilter.indexOf(key) === -1);
        if (React.Children.count(children) > 0) {
            return (
                <ListItem {...{ last }} style={itemStyle}>
                    <Body>
                        <Item
                            style={styles.field}
                            floatingLabel={false}
                            stackedLabel={false}
                        >
                            <Label style={{fontSize: 12, fontFamily: "Avenir-Book"}} {...{ style }}>{label}</Label>
                            {children}
                        </Item>
                    </Body>
                    {
                        right && <Right>{right()}</Right>
                    }
                </ListItem>
            );
        }
        return (
            <ListItem {...{ last }} style={[itemStyle, itemBorder]}>
                <Body>
                    <Item
                        style={styles.field}
                        floatingLabel={!defaultValue}
                        stackedLabel={!!defaultValue}
                    >
                        { displayIcon ? (<Icon name={iconName} style={{color: iconColor, paddingRight: 18, top: 12}}></Icon>) : (<View></View>) }<Label {...{ style }} style={{color:labelColor, marginLeft: 8, fontSize: 15, fontFamily: "Avenir-Book"}}>{label}</Label>
                        <Input onChangeText={this.setValue} getRef={textInputRef} {...{ value }} style={[style, doubleLine]} {...props} />
                    </Item>
                </Body> 
                {
                    right && <Right>{right()}</Right>
                }
            </ListItem>
        );
    }
}

const styles = StyleSheet.create({
    field: { borderBottomWidth: 0, fontFamily: "Avenir-Book" }
});
