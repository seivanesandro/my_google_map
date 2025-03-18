/*TODO: animation keyframe



@styled-components

const Show = keyframes`
    0%{
        opacity:0;
    }
    50%{
        opacity:0.5;
    }

    100%{
        opacity:1;
    }
`;

animation: ${Show} 2.5s linear;

*/

//TODO:Devices Responsive
/*
Mobile: 360 x 640.
Mobile: 375 x 667.
Mobile: 360 x 720.
iPhone14: 430 x 932.
Pixel 2: 411 x 731.
Tablet: 768 x 1024.
Laptop: 1366 x 768.
High-res laptop or desktop: 1920 x 1080.

media styled components 
@media only screen and (${devices.fourk }) {}
@media only screen and (${devices.portatilL }) {}
@media only screen and (${devices.portatil }) {}
@media only screen and (${devices.portatilS }) {}
@media only screen and (${devices.tablet }) {}
@media only screen and (${devices.iphone14 }) {}
@media only screen and (${devices.mobileG }) {}
@media only screen and (${devices.mobileM }) {}
@media only screen and (${devices.mobileP }) {}



media css 
@media only screen and (max-width: 2560px) {}
@media only screen and (max-width: 1440px) {}
@media only screen and (max-width: 1230px) {}
@media only screen and (max-width: 1024px) {}
@media only screen and (max-width: 768px) {}
@media only screen and (max-width: 430px) {}
@media only screen and (max-width: 425px) {}
@media only screen and (max-width: 375px) {}
@media only screen and (max-width: 320px) {}

@css keyframes

@keyframes slide-in {
  from {
    transform: translateX(0%);
  }

  to {
    transform: translateX(100%);
  }
}
animation: ${Show} 2.5s linear;

*/

const responsivePoints = {
    mobileP: '320px',
    mobileM: '375px',
    mobileG: '425px',
    iphone14: '430px',
    tablet: '768px',
    portatilS: '832px',
    portatil: '1024px',
    portatilL: '1440px',
    fourk: '2560px'
};

export const devices = {
    mobileP: `( max-width: ${responsivePoints.mobileP} )`,
    mobileM: `( max-width: ${responsivePoints.mobileM} )`,
    mobileG: `( max-width: ${responsivePoints.mobileG} )`,
    iphone14: `( max-width: ${responsivePoints.iphone14} )`,
    tablet: `( max-width: ${responsivePoints.tablet} )`,
    portatilS: `( max-width: ${responsivePoints.portatilS} )`,
    portatil: `( max-width: ${responsivePoints.portatil} )`,
    portatilL: `( max-width: ${responsivePoints.portatilL} )`,
    fourk: `( max-width: ${responsivePoints.fourk} )`
};
