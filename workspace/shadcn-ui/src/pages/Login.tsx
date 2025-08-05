import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { sendVerificationSMS, verifyCode } from '@/lib/twilio-service';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Function to format phone number as user types
  const formatPhoneNumber = (input: string) => {
    // Remove non-digit characters
    const cleaned = input.replace(/\D/g, '');
    
    // Format with international code if needed
    if (cleaned.length > 0) {
      if (!input.startsWith('+')) {
        return '+' + cleaned;
      }
    }
    
    return input;
  };

  // Handle phone number input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
    setError('');
  };

  // Handle sending SMS verification
  const handleSendVerification = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // In development, this will log the code to console
      // In production, it will send an SMS via Twilio
      await sendVerificationSMS(phoneNumber);
      setIsVerifying(true);
      setCodeSent(true);
      
      // Set countdown timer (10 minutes)
      setTimeLeft(10 * 60);
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
    } catch (error) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format the countdown timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle login with verification
  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      setError('Please enter both phone number and password');
      return;
    }

    if (isVerifying && !verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // If we're in verification mode, verify the code first
      if (isVerifying) {
        // Verify the code
        const isValid = verifyCode(phoneNumber, verificationCode);
        if (!isValid) {
          setError('Invalid or expired verification code');
          setIsLoading(false);
          return;
        }
      }

      // After verification is successful or if we're skipping verification in dev mode
      const success = await login(phoneNumber, password);
      
      if (success) {
        navigate('/');
      } else {
        setError('Invalid phone number or password');
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>TaskFlow Calendar</CardTitle>
          <CardDescription>
            Sign in to access your calendar and tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={isVerifying}
              />
            </div>
            
            {!isVerifying ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleSendVerification}
                  disabled={isLoading || !phoneNumber}
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="code">Verification Code</Label>
                    {timeLeft > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {formatTime(timeLeft)}
                      </span>
                    )}
                  </div>
                  <Input
                    id="code"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => {
                      setVerificationCode(e.target.value);
                      setError('');
                    }}
                  />
                  {timeLeft === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={handleSendVerification}
                    >
                      Resend Code
                    </Button>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleLogin}
                  disabled={isLoading || !verificationCode || !password}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </>
            )}
            
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            TaskFlow Calendar - SMS Authentication
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}