// @flow
/* eslint-disable global-require */
import { Asset } from "expo-asset";

import Login from "../../../assets/images/login.png";
import SignUp from "../../../assets/images/signUp.jpg";
import Walkthrough from "../../../assets/images/walkthrough.jpg";
import Profile from "../../../assets/images/profile.jpg";
import Done from "../../../assets/images/done.png";
import web_bg from "../../../assets/videos/web.mp4";
import web_mobile_bg from "../../../assets/images/web_mobile_bg.jpg";
import home_bg from "../../../assets/images/home_bg.jpg";
import home_bg_more from "../../../assets/images/home_bg_more.jpg";

/* import DefaultAvatar from "../../../assets/images/avatars/default-avatar.jpg";
import DefaultAvatar1 from "../../../assets/images/avatars/avatar-1.jpg";
import DefaultAvatar2 from "../../../assets/images/avatars/avatar-2.jpg";
import DefaultAvatar3 from "../../../assets/images/avatars/avatar-3.jpg"; */

import iconBreath from "../../assets/menuIcons/menu-icon-breath.png";
import iconWork from "../../assets/menuIcons/menu-icon-work.png";
import iconChallenge from "../../assets/menuIcons/menu-icon-mountain.png";
import iconBreak from "../../assets/menuIcons/menu-icon-break.png";
import iconHome from "../../assets/menuIcons/menu-icon-home.png";
import iconDots from "../../assets/menuIcons/menu-icon-dots.png";
import iconBreathEmpty from "../../assets/menuIcons/menu-icon-breath-e.png";
import iconWorkEmpty from "../../assets/menuIcons/menu-icon-work-e.png";
import iconChallengeEmpty from "../../assets/menuIcons/menu-icon-mountain-e.png";
import iconBreakEmpty from "../../assets/menuIcons/menu-icon-break-e.png";
import iconHomeEmpty from "../../assets/menuIcons/menu-icon-home-e.png";
import iconDotsEmpty from "../../assets/menuIcons/menu-icon-dots-e.png";

import Music from "../../../assets/images/music.jpg";
import Architecture from "../../../assets/images/architecture.jpg";
import Travel from "../../../assets/images/travel.jpg";

import Logo from "../../../assets/images/logo.png";
import Header from "../../../assets/images/app_header.png";

import MT1 from "../../../assets/images/MT_1.png";
import Tools_1 from "../../../assets/images/tools_1.png";

import splash from "../../../assets/splash_tlex.png"
import smile from "../../../assets/images/smile.png"
import tlex_white from "../../../assets/images/tlex_white.png"
import tlex_orig from "../../../assets/images/tlex_logo_orig.png"
import arrow_right from "../../../assets/images/arrow_right.png"
import back_arrow from "../../../assets/images/back_arrow.png"
import play_btn from "../../../assets/images/round_play.png"
import btn_play from "../../../assets/images/btn-play.png"
import btn_pause from "../../../assets/images/btn-pause.png"
import dog_bg from "../../../assets/images/dog_bg.png"
import generic_thumb from "../../../assets/images/generic_thumb.jpg"

import mountain_lake from "../../../assets/videos/bg_lake.mp4"
import mountain_summer from "../../../assets/videos/bg_summer.mp4"
import mountain_winter from "../../../assets/videos/bg_winter.mp4"

import mountain_lakemp3 from "../../../assets/audio/lake.mp3"


/* import heart_brain from "../../../assets/images/heart-brain.png" */

export default class Images {
     static login = Login;
    static signUp = SignUp;
    static walkthrough = Walkthrough;
    static profile = Profile;
    static done = Done;
    static web_bg = web_bg;
    static web_mobile_bg = web_mobile_bg;
    static home_bg = home_bg;
    static home_bg_more = home_bg_more; 

    static iconHome = iconHome;
    static iconBreak = iconBreak;
    static iconWork = iconWork;
    static iconChallenge = iconChallenge;
    static iconBreath = iconBreath;
    static iconDots = iconDots;
    static iconHomeEmpty = iconHomeEmpty;
    static iconBreakEmpty = iconBreakEmpty;
    static iconWorkEmpty = iconWorkEmpty;
    static iconChallengeEmpty = iconChallengeEmpty;
    static iconBreathEmpty = iconBreathEmpty;
    static iconDotsEmpty = iconDotsEmpty;    
    
/*     static defaultAvatar = DefaultAvatar;
    static avatar1 = DefaultAvatar1;
    static avatar2 = DefaultAvatar2;
    static avatar3 = DefaultAvatar3; */

    static logo  = Logo;
    static header  = Header;
    static music = Music;
    static architecture = Architecture;
    static travel = Travel;

    static MT1 = MT1;
    static Tools_1 = Tools_1;

    static splash = splash;
    static smile = smile;
    static tlex_white = tlex_white;
    static tlex_orig = tlex_orig;
    static arrow_right = arrow_right;
    static back_arrow = back_arrow;
    static play_btn = play_btn;
    static btn_play = btn_play;
    static btn_pause = btn_pause;
    static dog_bg = dog_bg;
    static generic_thumb = generic_thumb;

    static mountain_lake = mountain_lake;
    static mountain_winter = mountain_winter;
    static mountain_summer = mountain_summer;

      static mountain_lakemp3 = mountain_lakemp3;

    /* static heart_brain = heart_brain; */

    static downloadAsync(): Promise<*>[] {
        return [
           /*  Asset.fromModule(Images.login).downloadAsync(),
            Asset.fromModule(Images.logo).downloadAsync(),
            Asset.fromModule(Images.signUp).downloadAsync(),
            Asset.fromModule(Images.walkthrough).downloadAsync(),
            Asset.fromModule(Images.profile).downloadAsync(),
            Asset.fromModule(Images.done).downloadAsync(),

            Asset.fromModule(Images.defaultAvatar).downloadAsync(),
            Asset.fromModule(Images.avatar1).downloadAsync(),
            Asset.fromModule(Images.avatar2).downloadAsync(),
            Asset.fromModule(Images.avatar3).downloadAsync(),

            Asset.fromModule(Images.music).downloadAsync(),
            Asset.fromModule(Images.architecture).downloadAsync(),
            Asset.fromModule(Images.travel).downloadAsync(), */

            Asset.fromModule(Images.btn_play).downloadAsync(),
            Asset.fromModule(Images.btn_pause).downloadAsync(),
            Asset.fromModule(Images.play_btn).downloadAsync(),
            Asset.fromModule(Images.dog_bg).downloadAsync(),

            Asset.fromModule(Images.mountain_lake).downloadAsync(),
            Asset.fromModule(Images.mountain_lakemp3).downloadAsync(),
            Asset.fromModule(Images.mountain_winter).downloadAsync(),
            Asset.fromModule(Images.mountain_summer).downloadAsync(),
            Asset.fromModule(Images.web_bg).downloadAsync(),
            Asset.fromModule(Images.web_mobile_bg).downloadAsync(),
          /*   Asset.fromModule(Images.heart_brain).downloadAsync(),
 */
            Asset.fromModule(Images.iconHome).downloadAsync(),
            Asset.fromModule(Images.iconHomeEmpty).downloadAsync(),
            Asset.fromModule(Images.iconBreak).downloadAsync(),
            Asset.fromModule(Images.iconBreakEmpty).downloadAsync(),
            Asset.fromModule(Images.iconChallenge).downloadAsync(),
            Asset.fromModule(Images.iconChallengeEmpty).downloadAsync(),
            Asset.fromModule(Images.iconWork).downloadAsync(),
            Asset.fromModule(Images.iconWorkEmpty).downloadAsync(),
            Asset.fromModule(Images.iconBreath).downloadAsync(),
            Asset.fromModule(Images.iconBreathEmpty).downloadAsync(),
            Asset.fromModule(Images.iconDots).downloadAsync(),
            Asset.fromModule(Images.iconDotsEmpty).downloadAsync(),        
        ];
    }
}
