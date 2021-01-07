// @flow
import * as React from "react";
import { View, StyleSheet, Image, SafeAreaView } from "react-native";
import { Button, Footer, FooterTab, Text, Icon } from "native-base";
import Swiper from "react-native-swiper";
import COLORS from "../assets/Colors";
import ButtonGD from "../components/ButtonGD";

import { Styles, Images, WindowDimensions } from "../components";
import type { ScreenProps } from "../components/Types";

import variables from "../../native-base-theme/variables/commonColor";
import { TouchableOpacity } from "react-native-gesture-handler";
import translate from "../../utils/language";

export default class Walkthrough extends React.PureComponent<ScreenProps<>> {
      
    
        
    
    // $FlowFixMe
    swiper = React.createRef();

    home = () => this.props.navigation.navigate("Main");

    buy = () => this.props.navigation.navigate("BuyScreen", {origin: 'walkthrough'});


    renderPagination = (): React.Node => (
        <View>
            {/*   <Footer
                style={{
                    borderTopWidth: variables.borderWidth,
                    borderBottomWidth: variables.borderWidth,
                }}
            >
                <FooterTab></FooterTab>
            </Footer> */}
        </View>
    );

    render(): React.Node {
        const { renderPagination } = this;
        let  showslide;
         const parent = this.props.navigation.dangerouslyGetParent();

       
    let source = null;
    let workshop ='';
    if (parent && parent.state && parent.state.params) {
        workshop = parent.state.params.workshop;   
    }
       
      
      
         if (workshop =='' || workshop == false) {
             showslide = true;
         }else {
             showslide = false;
         }

        return (
            <SafeAreaView style={style.container}>
                {/* <Image source={Images.walkthrough} style={style.img} /> */}
                {
                    // $FlowFixMe
                    <Swiper
                        ref={this.swiper}
                        height={swiperHeight}
                        dot={
                            <Icon
                                name="ios-radio-button-off"
                                style={style.dot}
                            />
                        }
                        activeDot={
                            <Icon
                                name="ios-radio-button-on"
                                style={style.dot}
                            />
                        }
                        {...{ renderPagination }}
                    >
                        <View style={[Styles.center, Styles.flexGrow]}>
                            <Image
                                source={require("../../assets/images/circle_walkthrough_1.png")}
                                style={{
                                    width: 220,
                                    height: 220,
                                }}
                            />
                            <Text style={style.pageTitle}>
                                 {translate("Walkthrough.offers")}
                            </Text>
                            <Text style={style.smallDesc}>
                               {translate("Walkthrough.inspire")}
                            </Text>
                            <Text style={style.smallDesc}>
                               {translate("Walkthrough.access")}
                            </Text>
                            <Text style={style.smallDesc}>
                                {translate("Walkthrough.more")}
                            </Text>
                            <View style={([Styles.center], { marginTop: 0 })}>
                                <ButtonGD
                                    title={translate("Walkthrough.next")}
                                    onpress={() => {
                                        this.swiper.current.scrollBy(1);
                                    }}
                                ></ButtonGD>
                            </View>
                        </View>

                        <View style={[Styles.center, Styles.flexGrow]}>
                            <Image
                                source={require("../../assets/images/circle_walkthrough_2.png")}
                                style={{
                                    width: 220,
                                    height: 220,
                                }}
                            />
                            <Text style={style.pageTitle}>
                                {translate("Walkthrough.behavior")}
                            </Text>
                            <Text style={style.smallDesc}>
                                {translate("Walkthrough.challenge")}
                            </Text>
                            <Text style={style.smallDesc}>
                                {translate("Walkthrough.follow")}
                            </Text>
                        { showslide ? (
                            <View style={([Styles.center], { marginTop: 10 })}>
                                <ButtonGD
                                    title={translate("Walkthrough.next")}
                                    onpress={() => {
                                        this.swiper.current.scrollBy(1);
                                    }}
                                ></ButtonGD>
                            </View>
                          ) :
                            <View style={([Styles.center], { marginTop: 20 })}>
                                <ButtonGD
                                    title={translate("Walkthrough.continue")}
                                    onpress={() => {
                                        this.home()
                                    }}
                                ></ButtonGD>
                            </View>
                        }
                        </View>

                        <View style={[Styles.center, Styles.flexGrow]}>
                            <Image
                                source={require("../../assets/images/circle_walkthrough_3.png")}
                                style={{
                                    width: 220,
                                    height: 220,
                                }}
                            />
                            <Text style={style.pageTitle}>
                               {translate("Walkthrough.welcome")}
                            </Text>
                            <Text style={style.smallDesc}>
                                {translate("Walkthrough.content")}
                            </Text>
                            <View style={([Styles.center], { marginTop: 20 })}>
                                <ButtonGD
                                    title={translate("Walkthrough.unlock")}
                                    onpress={() => {
                                        this.buy();
                                    }}
                                ></ButtonGD>
                            </View>
                            
                            <View>
                                <TouchableOpacity onPress={() => this.home()}>
                                    <Text style={style.smallLink}>
                                        {translate("Walkthrough.continuefree")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Swiper>
                }
            </SafeAreaView>
        );
    }
}

// eslint-disable-next-line react/prefer-stateless-function
class Phone extends React.PureComponent<{}> {
    render(): React.Node {
        return (
            <View style={style.phone}>
                <View style={style.phoneContainer}>
                    <Icon
                        name="ios-checkmark-circle"
                        style={style.phoneContainerIcon}
                    />
                </View>
                <View style={style.phoneFooter}>
                    <Icon
                        name="ios-radio-button-off"
                        style={style.phoneFooterIcon}
                    />
                </View>
            </View>
        );
    }
}

const { height } = WindowDimensions;
const borderWidth = variables.borderWidth * 2;
const swiperHeight = height;
const style = StyleSheet.create({
    container: {
        flex: 1,
    },
    img: {
        ...WindowDimensions,
        ...StyleSheet.absoluteFillObject,
    },
    pageTitle: {
        fontSize: 20,
        fontFamily: "Avenir-Black",
        color: COLORS.black,
        paddingLeft: 45,
        paddingRight: 45,
        textAlign: "center",
    },
    smallDesc: {
        color: COLORS.black,
        fontSize: 14,
        textAlign: "center",
        marginTop: 5,
        marginLeft: 35,
        marginRight: 35,
    },
    smallLink: {
        color: COLORS.black,
        fontSize: 14,
        textDecorationLine: "underline",
        textAlign: "center",
        marginTop: 25,
        marginLeft: 35,
        marginRight: 35,
    },
    next: {
        borderRadius: 0,
        borderLeftWidth: variables.borderWidth,
        marginLeft: variables.borderWidth,
        borderColor: "white",
    },
    phone: {
        borderColor: "white",
        borderWidth,
        borderRadius: 4,
        height: 175,
        width: 100,
        marginBottom: variables.contentPadding,
    },
    phoneContainer: {
        flex: 0.8,
        justifyContent: "center",
        alignItems: "center",
    },
    phoneFooter: {
        flex: 0.2,
        borderColor: "white",
        borderTopWidth: borderWidth,
        justifyContent: "center",
        alignItems: "center",
    },
    dot: {
        fontSize: 12,
        margin: 4,
        color: COLORS.orange,
    },
    phoneContainerIcon: {
        fontSize: 45,
    },
    phoneFooterIcon: {
        fontSize: 15,
    },
});
