import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-900 opacity-50"></div>
      
      {/* Home Button */}
      <div className="fixed top-6 left-6 z-50">
        <Link href="/">
          <button className="bg-stone-700 hover:bg-stone-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
            <i className="fa-solid fa-home text-xl"></i>
          </button>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Clerk Sign Up Component */}
        <div className="w-full">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "w-full mx-auto",
                card: "bg-stone-800 border border-stone-600 shadow-2xl rounded-2xl",
                headerTitle: "text-stone-100",
                headerSubtitle: "text-stone-300",
                socialButtonsIconButton: {
                  backgroundColor: '#57534e',
                  borderColor: '#78716c',
                  color: '#f5f5f4',
                  '&:hover': {
                    backgroundColor: '#6b7280'
                  }
                },
                dividerLine: {
                  backgroundColor: '#78716c'
                },
                dividerText: {
                  color: '#d6d3d1',
                  fontWeight: '500'
                },
                formFieldLabel: "text-stone-200 font-medium",
                formFieldInput: "bg-stone-700 border-stone-600 text-stone-100 placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20",
                footerActionLink: "text-orange-400 hover:text-orange-300",
                identityPreviewText: "text-stone-300",
                identityPreviewEditButton: "text-orange-400 hover:text-orange-300",
                formButtonPrimary: "bg-orange-500 hover:bg-orange-600 text-white font-medium",
                footerActionText: "text-stone-300",
                alternativeMethodsBlockButton: "bg-stone-700 border-stone-600 text-stone-100 hover:bg-stone-600",
                otpCodeFieldInput: "bg-stone-700 border-stone-600 text-stone-100",
                formResendCodeLink: "text-orange-400 hover:text-orange-300",
                formFieldSuccessText: "text-green-400",
                formFieldErrorText: "text-red-400",
                formFieldWarningText: "text-yellow-400",
                formFieldHintText: "text-stone-400"
              },
              variables: {
                colorPrimary: '#f97316',
                colorBackground: '#292524',
                colorInputBackground: '#44403c',
                colorInputText: '#f5f5f4',
                colorText: '#f5f5f4',
                colorTextSecondary: '#a8a29e',
                colorTextOnPrimaryBackground: '#ffffff',
                colorNeutral: '#78716c',
                colorDanger: '#ef4444',
                colorSuccess: '#10b981',
                colorWarning: '#f59e0b',
                borderRadius: '0.75rem',
                fontFamily: 'inherit'
              }
            }}
            redirectUrl="/courses"
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </div>
  );
}