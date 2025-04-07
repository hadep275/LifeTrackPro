const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-4">
      <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} LifeTrack App. All data is stored locally in your browser.
      </div>
    </footer>
  );
};

export default Footer;
