interface LayoutContainerProps {
  children: React.ReactNode;
}

export default function LayoutContainer({ children }: LayoutContainerProps) {
  return (
    <div
      className="
        w-full
        max-w-7xl
        mx-auto
        px-4
        sm:px-6
        lg:px-10
        py-5
        sm:py-8
        lg:py-12
        overflow-x-hidden
        animate-fadeIn
      "
    >
      {children}
    </div>
  );
}
