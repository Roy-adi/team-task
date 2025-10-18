export const Signup = {
  container: "min-h-screen flex items-center justify-center bg-gray-50 p-4 mt-24",
  toastBase: "fixed top-4 right-4 p-3 rounded-md",
  toastSuccess: "bg-green-100 text-green-700",
  toastError: "bg-red-100 text-red-700",
  card: "w-full max-w-2xl bg-white rounded-lg shadow-sm p-8",
  backLink: "flex items-center text-gray-600 mb-8",
  iconContainer: "mx-auto mb-4 bg-gray-100 w-fit p-3 rounded-full",
  heading: "text-2xl font-bold text-gray-800",
  subtext: "text-gray-600 mt-2",
  form: "space-y-4",
  label: "block text-gray-700 mb-2",
  inputWrapper: "relative",
  input: "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#43C6AC] focus:border-[#43C6AC] text-gray-800 placeholder-gray-400",
  passwordInput: "w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#43C6AC] focus:border-[#43C6AC] text-gray-800 placeholder-gray-400",
  togglePassword: "absolute right-3 top-3.5 text-gray-400",
  submitBtn: "w-full bg-[#43C6AC] text-white py-3 rounded-lg hover:bg-[#368f7a] transition-colors",
  footerText: "mt-6 text-center text-gray-600",
  link: "text-[#43C6AC] hover:underline",
  iconLeft: "absolute left-3 top-3.5 h-5 w-5 text-gray-400",
  radioGroup: "flex gap-6 mt-2",
  radioLabel: "flex items-center gap-2 text-gray-700",
  radioInput: "accent-[#43C6AC] cursor-pointer"
};

export const loginStyles = {
  container: "min-h-screen flex items-center justify-center bg-gray-50 p-4 mt-9",
  toast: (type) =>
    `fixed top-4 right-4 p-3 rounded-md ${
      type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`,
  card: "w-full max-w-md bg-white rounded-lg shadow-sm p-8",
  backLink: "flex items-center text-gray-600 mb-8",
  iconCircle: "mx-auto mb-4 bg-gray-100 w-fit p-3 rounded-full",
  heading: "text-2xl font-bold text-gray-800 mb-2",
  subheading: "text-gray-600",
  form: "space-y-4",
  label: "block text-gray-700 mb-2",
  inputWrapper: "relative",
  input:
    "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#43C6AC] focus:border-[#43C6AC] text-gray-800 placeholder-gray-500",
  passwordInput:
    "w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#43C6AC] focus:border-[#43C6AC] text-gray-800 placeholder-gray-500",
  togglePassword: "absolute right-3 top-3.5 text-gray-400",
  submitButton:
    "w-full bg-[#43C6AC] text-white py-3 rounded-lg hover:bg-[#368f7a] transition-colors disabled:opacity-70",
  footerText: "mt-6 text-center text-gray-600",
  footerLink: "text-[#43C6AC] hover:underline",
  signedInContainer: "text-center",
  signedInIcon: "mb-6 bg-gray-100 w-fit mx-auto p-3 rounded-full",
  signedInHeading: "text-xl font-bold text-gray-800 mb-4",
  homepageButton:
    "w-full bg-[#43C6AC] text-white py-3 rounded-lg hover:bg-[#368f7a] transition-colors mb-2",
  signOutButton:
    "w-full text-gray-600 py-3 rounded-lg border hover:bg-gray-50 transition-colors",
}