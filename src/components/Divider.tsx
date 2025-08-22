export function Divider() {
  return (
    <>
      {/* For Mobile */}
      <div className="w-full h-px bg-gray-300 md:hidden"></div>
      {/* For Desktop */}
      <div className="hidden md:block w-px bg-gray-300 my-8"></div>
    </>
  );
}
