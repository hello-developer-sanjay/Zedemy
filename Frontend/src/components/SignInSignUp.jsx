/* eslint-disable react/jsx-no-target-blank */
import { useState } from 'react';
import Register from '../pages/Register';
import Login from '../pages/Login';
import styled from 'styled-components';
import SecurityImage from '../assets/security.gif'; 
import { Helmet } from "react-helmet"; 
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1a1a1d;
  padding: 2rem;
`;
const AuthBox = styled.div`
  background: linear-gradient(135deg, #8a2387, #e94057, #f27121);
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  max-width: 1000px;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  position: relative;
  transform: perspective(1000px) rotateY(10deg);
  transition: transform 0.5s ease;
  &:hover {
    transform: perspective(1000px) rotateY(0);
  }
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
const FormContainer = styled.div`
  padding: 0rem;
  width: 50%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-right: 2px solid #f27121;
  position: relative;
  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
    border-bottom: 2px solid #f27121;
  }
`;

const Title = styled.h1`
  font-family: 'Cinzel Decorative', cursive;
  color: #1a1a1d;
  text-align: center;
  margin-bottom: 0rem;
`;
const ToggleFormText = styled.p`
  color: #1a1a1d;
  text-align: center;
  cursor: pointer;
  font-family: 'Cinzel', serif;
  &:hover {
    color: #f27121;
  }
`;
const AuthImage = styled.div`
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  @media (max-width: 768px) {
    width: 100%;
  }
`;
const SecurityGif = styled.img`
  max-width: 100%;
  border-radius: 0 20px 20px 0;
`;
function SignInSignUp({ showCloseButton }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };
  const handleClose = () => {
    setIsSignUp(false);
  };
  return (
    <Container>
       <Helmet>
    <title>Login | Zedemy - Access Customized Learning, Certificates, and Expert Content</title>
 <meta
   name="description"
   content="
Log in to Zedemy to access your personalized learning journey, curated educational content, and community-driven insights. Join our vibrant community founded by Sanjay Patidar, where technology meets education to deliver top-notch tutorials, articles, and user-generated blogs. Create and follow customized categories, mark completed posts, and earn certificates to validate your mastery in various subjects. Receive timely notifications on new content and stay updated with the latest educational discoveries. Experience an unparalleled learning environment that combines comprehensive resources with the transformative power of technology. Sign in now to unlock endless learning possibilities."
 />
 <meta property="og:title" content="Login | Zedemy - Access Customized Learning, Certificates, and Expert Content" />
 <meta property="og:description" content="Log in to Zedemy to access your personalized learning journey, curated educational content, and community-driven insights. Join our vibrant community founded by Sanjay Patidar, where technology meets education to deliver top-notch tutorials, articles, and user-generated blogs. Create and follow customized categories, mark completed posts, and earn certificates to validate your mastery in various subjects. Receive timely notifications on new content and stay updated with the latest educational discoveries. Experience an unparalleled learning environment that combines comprehensive resources with the transformative power of technology. Sign in now to unlock endless learning possibilities."/> 
 <meta property="og:type" content="website" />
 <meta property="og:url" content="https://learnandshare.vercel.app/login" />
 <meta property="og:image" content="https://sanjaybasket.s3.ap-south-1.amazonaws.com/zedemy-logo.png" />
 <meta property="og:image:alt" content="Sanjay Patidar" />
 <meta property="og:site_name" content="Login | Zedemy - Access Customized Learning, Certificates, and Expert Content" />
  <link rel="canonical" href="https://learnandshare.vercel.app/login" />

 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:title" content="Login | Zedemy - Access Customized Learning, Certificates, and Expert Content" />
 <meta name="twitter:description" content="Log in to Zedemy to access your personalized learning journey, curated educational content, and community-driven insights. Join our vibrant community founded by Sanjay Patidar, where technology meets education to deliver top-notch tutorials, articles, and user-generated blogs. Create and follow customized categories, mark completed posts, and earn certificates to validate your mastery in various subjects. Receive timely notifications on new content and stay updated with the latest educational discoveries. Experience an unparalleled learning environment that combines comprehensive resources with the transformative power of technology. Sign in now to unlock endless learning possibilities." />
 <meta name="twitter:image" content="https://sanjaybasket.s3.ap-south-1.amazonaws.com/zedemy-logo.png" />
 <meta name="twitter:site" content="@sanjaypatidar" />
 <meta name="twitter:creator" content="@sanjaypatidar" />

 <meta name="keywords" content="Zedemy login, personalized learning, educational content, community insights, technology education, user blogs, curated tutorials, educational articles, certificate validation, learning categories, user notifications, educational discoveries, learning platform, tech tutorials, online learning, user-generated content, learning journey, educational resources
portfolio,verification , certificate verify , certfication verification, signup , eduxcel ,founder: Sanjay patidar , tech, education, careers, opportunity, personal-portfolio,developer_sanju,sanjay, Sanjay, SANJAY, Sanjay Patidar, SANJAY PATIDAR, SANJAY WEB DEVELOPER, SANJAY DEVELOPER, Full Stack Web Developer, Mern Stack Web Developer, sanjay patidar, sanjay-patidar, professional, web developer portfolio, coder, web development, UI/UX design, Chandigarh University, EduXcel, Indore,contact, developer, programmer, engineer, AI, Artificial Intelligence ,tech enthusiastic, creativity ,creator, work , technology, coding, projects, experiences, resume, cv" />
 <meta name="author" content="Sanjay Patidar" />   
    </Helmet>	
      <AuthBox className={`auth-box ${isSignUp ? 'register' : 'login'}`}>
        <FormContainer>
          <Title>{isSignUp ? 'Sign Up - Zedemy' : 'Sign In - Zedemy'}</Title>
          <div>{isSignUp ? <Register /> : <Login />}</div>
          <ToggleFormText onClick={toggleForm}>
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </ToggleFormText>
        </FormContainer>
        <AuthImage>
          <SecurityGif src={SecurityImage} alt="Security" />
        </AuthImage>
      </AuthBox>
    </Container>
  );
}
export default SignInSignUp;
