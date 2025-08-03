'use client';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { 
  MdCheckCircle, 
  MdArrowBack,
  MdHome,
  MdUpload,
  MdAccountCircle,
  MdSearch,
  MdNotifications,
  MdSettings
} from 'react-icons/md';
import Link from 'next/link';

export default function ChildProfileAddedSuccess() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-24">
      <Head>
        <title>Ilyzlist - Child Added</title>
      </Head>

      {/* Updated Header to match other pages */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-[#ECF1FF] rounded-full transition-colors"
            aria-label="Go back"
          >
            <MdArrowBack className="w-5 h-5 text-[#3742D1]" />
          </button>
          <h1 className="text-xl font-bold text-[#3742D1] font-league-spartan">Success</h1>
        </div>
        <div className="flex gap-4">
          <button className="p-2" aria-label="Search">
            <MdSearch className="w-5 h-5 text-[#3742D1]" />
          </button>
          <Link href="/notifications" className="p-2" aria-label="Notifications">
            <MdNotifications className="w-5 h-5 text-[#3742D1]" />
          </Link>
          <Link href="/settings" className="p-2" aria-label="Settings">
            <MdSettings className="w-5 h-5 text-[#3742D1]" />
          </Link>
        </div>
      </header>

      {/* Success Content */}
      <div className="flex flex-col items-center justify-center py-12">
        <div className="border-[10px] border-[#7BDCB5] rounded-full p-4 mb-8">
          <MdCheckCircle className="w-24 h-24 text-[#7BDCB5]" />
        </div>

        <h2 className="text-2xl font-bold text-center text-[#3742D1] mb-2 font-league-spartan">
          Congratulations!
        </h2>
        <p className="text-lg text-center text-[#3742D1] mb-8 font-league-spartan">
          Child Profile Added Successfully
        </p>

        <div className="bg-[#ECF1FF] rounded-[27px] p-6 w-full max-w-xs">
          <p className="text-center text-[#3742D1] mb-6 font-league-spartan">
            Would you like to add another child?
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => router.push("/profile/add")}
              className="flex-1 bg-[#3742D1] text-white py-3 rounded-[50px] font-medium hover:bg-[#2a35b0] transition-colors font-league-spartan"
            >
              Yes!
            </button>

            <button
              onClick={() => router.push("/")}
              className="flex-1 bg-white text-[#3742D1] py-3 rounded-[50px] font-medium border border-[#3742D1] hover:bg-[#ECF1FF] transition-colors font-league-spartan"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Updated Bottom Navigation to match other pages */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <button
          onClick={() => router.push('/')}
          className="p-2 flex flex-col items-center"
          aria-label="Home"
        >
          <MdHome className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1 font-league-spartan">Home</span>
        </button>
        <button
          onClick={() => router.push('/drawings/upload')}  // Changed to upload route
          className="p-2 flex flex-col items-center"
          aria-label="Upload"
        >
          <MdUpload className="w-6 h-6 text-white" />  {/* Changed to Upload icon */}
          <span className="text-white text-xs mt-1 font-league-spartan">Upload</span>  {/* Changed label */}
        </button>
        <button
          onClick={() => router.push('/account')}
          className="p-2 flex flex-col items-center"
          aria-label="Account"
        >
          <MdAccountCircle className="w-6 h-6 text-white" />
          <span className="text-white text-xs mt-1 font-league-spartan">Account</span>
        </button>
      </nav>

      <style jsx global>{`
        @font-face {
          font-family: "League Spartan";
          src:
            url("/fonts/league-spartan.woff2") format("woff2"),
            url("/fonts/league-spartan.woff") format("woff");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        .font-league-spartan {
          font-family: "League Spartan", sans-serif;
        }
      `}</style>
    </div>
  );
}