import styled from 'styled-components';
import { devices } from '../../utils/constantes';

const FooterStyle = styled.footer`
    background-color: #333;
    color: #fff !important;
    text-align: center;
    padding: 3rem 0 0.5rem 0 !important;
    border-top: 1px solid #fff;
`;

const StyledFooter = styled.p`
    font-size: 1rem;
    text-align: center;
    margin: 1rem auto;

    @media only screen and (${devices.tablet}) {
        margin: 1rem auto 0.1rem auto;
        font-size: 1.2rem;
    }
    @media only screen and (${devices.iphone14}) {
        font-size: 1.2rem;
    }
    @media only screen and (${devices.mobileG}) {
        font-size: 1.2rem;
    }
    @media only screen and (${devices.mobileM}) {
        font-size: 1.2rem;
    }
    @media only screen and (${devices.mobileP}) {
        font-size: 1.2rem;
    }
`;

const Footer = props => {
    return (
        <>
            <FooterStyle>
                <StyledFooter className="footer">
                    copyrights Sandro seivane 2024
                </StyledFooter>
                <p>
                    <a href="http://jigsaw.w3.org/css-validator/check/referer">
                        <img
                            style={{border:'0',width:'88px',height:'31px'}}
                            src="http://jigsaw.w3.org/css-validator/images/vcss-blue"
                            alt="Valid CSS!"
                        />
                    </a>
                </p>
            </FooterStyle>
        </>
    );
};

Footer.propTypes = {};

export default Footer;
