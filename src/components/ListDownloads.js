import moment from "moment";
import React, { Component } from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    ActivityIndicator,
    Alert,
} from "react-native";
import { H3 } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import type { ScreenProps } from "./Types";
import { FavButton, DelButton, LockButton, Styles } from ".";
import {
    getContent,
    getFavouritesID,
    removeFav,
    addFav,
} from "../../modules/firebaseAPI";
import {SectionTitle, CachedImage} from "../components"
import variables from "../../native-base-theme/variables/commonColor";
import { Video } from "expo";
import WindowDimensions from "./WindowDimensions";
import COLORS from "../assets/Colors";
import { LinearGradient } from "expo-linear-gradient";
import i18n from "i18n-js";
import Toast, { DURATION } from "react-native-easy-toast";
import * as FirebaseAPI from "../../modules/firebaseAPI.js";
import translate from "../../utils/language";
import AsyncStorage from "@react-native-community/async-storage";
import { checkInternetConnection } from 'react-native-offline';
// import { ActivityIndicator } from "react-native-paper";
// import * as InAppPurchases from 'expo-in-app-purchases';

import {removeDownload} from "../../modules/firebaseAPI";
import {deleteOfflineAsset} from "../../modules/localStorageAPI";


// const urlimg = 'https://gesundes-und-achtsames-fuehren.de/assets/app/image/';
const urlimg =
    "https://tlexeurope.s3.eu-central-1.amazonaws.com/images/portaits/";

export default class ListDownloads extends Component {
    constructor(props) {
        super(props);
        this.state = {
            meditations: [],
            favourites: [],
            premium: false,
            lifetime: false,
            online: true
        };
    }

    componentDidMount() {
        this.setContentData();
        // this.getFavs();
        this.focusListener = this.props.navigation.addListener(
            "didFocus",
            () => {
                this.setContentData();
            }
        );
    }

  
    getOfflineData = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('downloadsContent')
          return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch(e) {
          console.log(e)
        }
    }

    setContentData = async () => {
        this.setState({contentReady: false})
        const isConnected = await checkInternetConnection();
        this.setState({online: isConnected})
        let offlineData = await this.getOfflineData();
        let dataSetDownloads = isConnected ? await FirebaseAPI.getDownloadsContent() : offlineData
        // const dataObj = await FirebaseAPI.getUser();
        // let premium = false;
        // let lifetime = false;
        // if (dataObj.premium != null) {
        //     premium = dataObj.premium;
        // }
        // if (dataObj.lifetime != null) {
        //     lifetime = dataObj.lifetime;
        // }
        // if (premium == false) {
        //     let workshopcode = dataObj.workshopcode;
        //     if (workshopcode != "") {
        //         this.setState({
        //             workshopPremium: await FirebaseAPI.getWorkshop(
        //                 workshopcode
        //             ),
        //         });
        //         premium = this.state.workshopPremium["Premium"];
        //     }
        // }
        this.setState({
            meditations: dataSetDownloads,
            contentReady: true,
            premium: true,
            lifetime: true,
        });
    };

    async getFavs() {
        let favourites = await getFavouritesID();
        this.setState({ favourites: favourites });
    }

    handleRemove = async (key, type) => {
        await removeDownload(key);
        await deleteOfflineAsset(key, type);
        //this.refs.toast.show(translate("Audios.downloadsremoved"), 1000);
        this.setContentData();
    }


    handleHeartClick = async (currentState, key, type) => {
        if (currentState) {
            let favs = [...this.state.favourites];
            favs.splice(favs.indexOf(key), 1);
            this.setState({ favourites: favs });
            await removeFav(key);
        } else {
            let favs = [...this.state.favourites];
            favs.push(key);
            this.setState({ favourites: favs });
            await addFav(key, type, this.state.category);
            this.refs.toast.show("Added to favourites", 1000);
        }
    };

    handleCategoryChange = (category, id) => {
        this.setState({ contentReady: false, selectedCat: id });
        this.setContentData(category);
    };

    render(): React.Node {
        const { cat } = this.props;
        const today = moment();
        const date = today.format("MMMM D");
        const dayOfWeek = today.format("dddd").toUpperCase();
        const { navigation } = this.props;
        return (
            <View style={styles.container}>
                <Toast
                    ref="toast"
                    style={{ backgroundColor: COLORS.orange }}
                    position="top"
                    positionValue={WindowDimensions.height / 3}
                    fadeInDuration={1000}
                    fadeOutDuration={3000}
                    opacity={0.9}
                />
                <View style={styles.meditationsArea}>
                    <SectionTitle label={translate("Download.my_downloads")} iconName="ios-cloud-download" />
                    {this.state.contentReady ? (
                        <MeditationRow
                            meditations={this.state.meditations}
                            favs={this.state.favourites}
                            title={this.state.title}
                            icon={this.state.icon}
                            userPremium={this.state.premium}
                            lifetime={this.state.lifetime}
                            navigation={this.props.navigation}
                            // selCat={this.props.cat[this.state.selectedCat]}
                            handleDelClick={this.handleRemove}
                           // delete = {this.handleDelete}
                            online = {this.state.online}
                        />
                    ) : (
                        <View style={styles.activityIndicatorWrapper}>
                            <ActivityIndicator color="orange" size="large" />
                        </View>
                    )}
                </View>
            </View>
        );
    }
}

class CategoryButton extends React.PureComponent {
    handleCategoryChange = () => {
        this.setState({ selected: true });
        this.props.categoryChange(this.props.category, this.props.id);
    };

    render() {
        let catego = this.props.section[this.props.category];
        let categ = catego[0].title;

        return (
            <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                    this.handleCategoryChange();
                }}
            >
                <LinearGradient
                    colors={[
                        this.props.active ? COLORS.blue : COLORS.orange,
                        this.props.active ? COLORS.lightblue : COLORS.lightgray,
                    ]}
                    start={[0.6, 0.5]}
                    end={[1, 0]}
                    style={styles.categoryTitle}
                >
                    <Text style={styles.thumbcategoryText}>{categ}</Text>
                </LinearGradient>
            </TouchableOpacity>
        );
    }
}

class MeditationThumb extends React.PureComponent {
    buyProduct = () => {
        this.props.navigation.navigate("BuyModal", { origin: "meditations" });
    };

    onDelClick = () => {
        this.props.handleDelClick(
            this.props.id,
            this.props.type
        );
    };   

   

    onThumbClick(locked) {
        if (locked) {
            this.buyProduct();
        } else {
            if (this.props.type == "audio") {
                this.props.navigation.navigate("Audios", {
                    category: translate("Download.my_downloads"),
                    Description: this.props.Description,
                    duration: this.props.duration,
                    trainer: this.props.trainer,
                    music: this.props.music,
                    key: this.props.id,
                    title: this.props.title,
                    photo: urlimg + this.props.id + "_cover.jpg",
                });
            } else {
                this.props.navigation.navigate("Player", {
                    category: translate("Download.my_downloads"),
                    Description: this.props.Description,
                    duration: this.props.duration,
                    trainer: this.props.trainer,
                    key: this.props.id,
                    title: this.props.title,
                    photo: urlimg + this.props.id + "_cover.jpg",
                });
            }
        }
    }

    render() {
        const { isfav, premium, userPremium, lifetime } = this.props;
        let locked = true;
        let heartColor = COLORS.lightgray;
        let title =
            this.props.title.length > 20
                ? this.props.title.substring(0, 18) + "..."
                : this.props.title;
        if (isfav) {
            heartColor = COLORS.orange;
        }
        if (userPremium || !premium || lifetime) {
            locked = false;
        }

        return (
            <View style={[styles.meditationThumb, Styles.shadow]}>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => this.onThumbClick(locked)}
                >
                    <CachedImage
                        style={[
                            styles.meditationThumbImage,
                            { backgroundColor: COLORS.lightgray },
                        ]}
                        title={this.props.id + "_thumb"}
                        resizeMode="cover"
                        source={{ uri: urlimg + this.props.id + "_thumb.png" }}
                    ></CachedImage>
                    {!this.props.hideHeart && (
                        <FavButton
                            handleFavPress={() => this.onDelClick()}
                            heartColor={COLORS.orange}
                            del={true}
                        />
                    )}
                    <LockButton locked={locked} />
                    <View style={styles.thumbTitle}></View>
                    <Text style={styles.thumbTitleText}>{title}</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

class MeditationRow extends React.PureComponent {
    renderItem = (data) => (
        <MeditationThumb
            Description={data.Description}
            duration={data.Duration}
            music={data.music}
            trainer={data.Trainer}
            url={data.url}
            navigation={this.props.navigation}
            id={data.id}
            title={data.title}
            image={data.thumbnail}
            active={data.toggle}
            userPremium={this.props.userPremium}
            lifetime={this.props.lifetime}
            trial={this.props.trial}
            premium={data.Premium}
            lock={data.lock}
            selCat={this.props.selCat}
            isfav={this.props.favs.includes(data.id)}
            handleDelClick={this.props.handleDelClick}
            type={data.Type}
            hideHeart={!this.props.online}
        />
    );

    render() {
        const { meditations, title, icon, online} = this.props;
        return (
            <View style={styles.meditationRowWrapper}>
                <View style={styles.meditationRow}>
                    <Ionicons
                        name={icon}
                        style={{ color: COLORS.orange }}
                        size={30}
                    />
                    <Text style={styles.meditationRowTitle}>{title}</Text>
                </View>
                <FlatList
                    style={{ alignSelf: "stretch" }}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    horizontal={false}
                    numColumns={2}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    data={meditations}
                    renderItem={({ item }) => this.renderItem(item)}
                    extraData={this.props.userPremium}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    videoContainer: {
        flex: 0.81,
        backgroundColor: "transparent",
    },
    loginContainer: {
        alignItems: "center",
        flexGrow: 0.95,
        justifyContent: "center",
    },
    backgroundVideo: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    header: {
        width: WindowDimensions.width,
        resizeMode: "contain",
        flex: 1,
        position: "absolute",
        top: 0,
        zIndex: 1000,
    },
    dashboard: {
        flex: 0.25,
        backgroundColor: "red",
        borderRadius: 30,
        marginTop: -25,
    },
    loadingCover: {
        width: WindowDimensions.width,
        height: WindowDimensions.height,
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 10000000,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingGradient: {
        paddingTop: WindowDimensions.height / 3,
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        alignSelf: "stretch",
    },
    loadingText: {
        color: COLORS.white,
        fontSize: 15,
    },
    meditationsArea: {
        marginTop: 10,
        flex: 1,
        alignItems: "center",
        alignSelf: "stretch",
        paddingLeft: 3,
        paddingRight: 3,
    },
    categoryWrapper: {
        height: 30,
        marginTop: 15,
    },
    meditationThumb: {
        marginTop: 15,
        paddingLeft: 7,
        paddingRight: 7,
    },
    meditationThumbImage: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: WindowDimensions.width * 0.4,
        height: WindowDimensions.width * 0.4 * (140 / 130),
        opacity: 0.9,
        borderRadius: 15,
    },
    thumbTitle: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 25,
        backgroundColor: "#000000",
        opacity: 0.3,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    thumbTitleText: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 5,
        fontSize: 12,
        textAlign: "center",
        color: COLORS.white,
    },
    categoryTitle: {
        height: 30,
        padding: 15,
        paddingTop: 5,
        paddingBottom: 5,
        marginRight: 15,
        backgroundColor: COLORS.blue,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    thumbcategoryText: {
        fontSize: 16,
        textAlign: "center",
        color: COLORS.white,
    },
    meditationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
        marginTop: 0,
    },
    meditationRowWrapper: {
        flex: 1,
        alignContent: "space-between",
        alignItems: "center",
        paddingBottom: 25,
        alignSelf: "stretch",
        paddingLeft: 10,
        paddingRight: 10,
    },
    meditationRowTitle: {
        color: COLORS.blue,
        fontSize: 16,
        marginLeft: 10,
        fontWeight: "bold",
    },
    btnFavWrapper: {
        position: "absolute",
        top: 7,
        right: 7,
    },
    activityIndicatorWrapper: {
        flex: 1,
        alignContent: "center",
        justifyContent: "center",
        alignSelf: "stretch",
        height: 500,
    },
});
