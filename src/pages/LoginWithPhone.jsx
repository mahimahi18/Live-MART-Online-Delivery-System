import { useState, useEffect } from 'react';
// FIX: Added .js extension to ensure the build tool finds the file
import { auth } from '../firebase.js'; 
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

// React-Bootstrap
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

// FIX: Removed 'react-bootstrap-icons' import to prevent build errors

export default function LoginWithPhone() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // Step 1: Phone, Step 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const navigate = useNavigate();

  // --- 1. Initialize Recaptcha on Mount ---
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'normal',
          'callback': (response) => {
            // reCAPTCHA solved
          },
          'expired-callback': () => {
            setError("Recaptcha expired. Please try again.");
          }
        });
      } catch (err) {
        console.error("Recaptcha init error:", err);
      }
    }
    // Cleanup logic
    return () => {
      if (window.recaptchaVerifier) {
        try {
            window.recaptchaVerifier.clear();
        } catch (e) {
            console.error(e);
        }
        window.recaptchaVerifier = null;
      }
    }
  }, []);

  // --- 2. Handle Send OTP ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!phoneNumber || phoneNumber.length < 10) {
       setError("Please enter a valid phone number with country code (e.g., +1234567890).");
       setLoading(false);
       return;
    }
    
    // Ensure number has + prefix
    const formattedNumber = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;

    try {
      // Re-init recaptcha if missing
      if (!window.recaptchaVerifier) {
           window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'normal',
            'callback': (response) => {},
            'expired-callback': () => setError("Recaptcha expired.")
          });
      }
      
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep(2); // Move to OTP step
      setLoading(false);
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(err.message || "Failed to send OTP.");
      setLoading(false);
      
      // Reset recaptcha on error so user can try again
      if (window.recaptchaVerifier) {
         try {
           window.recaptchaVerifier.clear();
         } catch(e) { console.error(e); }
         window.recaptchaVerifier = null; 
         // Reloading page might be needed if recaptcha completely fails, 
         // but usually clearing works for a retry.
      }
    }
  };

  // --- 3. Handle Verify OTP ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      setLoading(false);
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      // Success! User is signed in.
      navigate('/'); // Redirect to home
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("Invalid OTP. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Theme Hero Section */}
      <Container fluid className="p-5 mb-5 text-center text-white shadow-lg" style={{ background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' }}>
        <h1 className="display-3 fw-bold">Login with Phone</h1>
        <p className="lead">Secure, password-less login.</p>
      </Container>

      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                {/* FIX: Using Emojis instead of external icons to avoid build errors */}
                <div className="text-center mb-4 display-1">
                   {step === 1 ? "📱" : "🔒"}
                </div>
                <h3 className="text-center mb-4 fw-bold">
                  {step === 1 ? "Enter Phone Number" : "Verify OTP"}
                </h3>

                {error && <Alert variant="danger">{error}</Alert>}

                {step === 1 ? (
                  // --- STEP 1: PHONE INPUT ---
                  <Form onSubmit={handleSendOtp}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number (with country code)</Form.Label>
                      <Form.Control 
                        type="tel" 
                        placeholder="+1 555 555 5555" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        required
                        size="lg"
                      />
                      <Form.Text className="text-muted">
                        Example: +1 for USA, +91 for India
                      </Form.Text>
                    </Form.Group>

                    {/* Recaptcha Container */}
                    <div id="recaptcha-container" className="mb-3 d-flex justify-content-center"></div>

                    <div className="d-grid gap-2 mt-4">
                      <Button variant="success" size="lg" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : "Send OTP"}
                      </Button>
                    </div>
                    
                     <div className="w-100 text-center mt-3">
                        <Link to="/login" className="text-decoration-none">Back to Email Login</Link>
                    </div>
                  </Form>
                ) : (
                  // --- STEP 2: OTP INPUT ---
                  <Form onSubmit={handleVerifyOtp}>
                    <Alert variant="info">OTP sent to {phoneNumber}</Alert>
                    <Form.Group className="mb-3">
                      <Form.Label>Enter 6-digit Code</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="123456" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                        required
                        size="lg"
                      />
                    </Form.Group>

                    <div className="d-grid gap-2 mt-4">
                      <Button variant="success" size="lg" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : "Verify & Login"}
                      </Button>
                      <Button variant="link" className="text-muted" onClick={() => setStep(1)}>
                        Change Phone Number
                      </Button>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}