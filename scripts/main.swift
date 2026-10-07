import Cocoa
import WebKit

class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    var window: NSWindow!
    var webView: WKWebView!

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupMenu()
        setupWindow()
        loadAppContent()
    }

    func setupMenu() {
        let mainMenu = NSMenu()

        // Application Menu
        let appMenuItem = NSMenuItem()
        let appMenu = NSMenu(title: "DevNotes")
        appMenu.addItem(withTitle: "Về DevNotes", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Ẩn DevNotes", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        let hideOthers = NSMenuItem(title: "Ẩn các ứng dụng khác", action: #selector(NSApplication.hideOtherApplications(_:)), keyEquivalent: "h")
        hideOthers.keyEquivalentModifierMask = [.command, .option]
        appMenu.addItem(hideOthers)
        appMenu.addItem(withTitle: "Hiện tất cả", action: #selector(NSApplication.unhideAllApplications(_:)), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Thoát DevNotes", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appMenuItem.submenu = appMenu
        mainMenu.addItem(appMenuItem)

        // File Menu
        let fileMenuItem = NSMenuItem()
        let fileMenu = NSMenu(title: "Tệp")
        fileMenu.addItem(withTitle: "Đóng cửa sổ", action: #selector(NSWindow.performClose(_:)), keyEquivalent: "w")
        fileMenuItem.submenu = fileMenu
        mainMenu.addItem(fileMenuItem)

        // Edit Menu (Essential for Cmd+C, Cmd+V, Cmd+A, Cmd+Z)
        let editMenuItem = NSMenuItem()
        let editMenu = NSMenu(title: "Chỉnh sửa")
        editMenu.addItem(withTitle: "Hoàn tác", action: #selector(UndoManager.undo), keyEquivalent: "z")
        let redoItem = NSMenuItem(title: "Làm lại", action: #selector(UndoManager.redo), keyEquivalent: "Z")
        editMenu.addItem(redoItem)
        editMenu.addItem(NSMenuItem.separator())
        editMenu.addItem(withTitle: "Cắt", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.addItem(withTitle: "Sao chép", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: "Dán", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: "Chọn tất cả", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        editMenuItem.submenu = editMenu
        mainMenu.addItem(editMenuItem)

        // View Menu
        let viewMenuItem = NSMenuItem()
        let viewMenu = NSMenu(title: "Xem")
        viewMenu.addItem(withTitle: "Tải lại trang", action: #selector(reloadWebView), keyEquivalent: "r")
        viewMenu.addItem(withTitle: "Toàn màn hình", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f")
        viewMenuItem.submenu = viewMenu
        mainMenu.addItem(viewMenuItem)

        // Window Menu
        let windowMenuItem = NSMenuItem()
        let windowMenu = NSMenu(title: "Cửa sổ")
        windowMenu.addItem(withTitle: "Thu nhỏ", action: #selector(NSWindow.performMiniaturize(_:)), keyEquivalent: "m")
        windowMenu.addItem(withTitle: "Phóng to", action: #selector(NSWindow.performZoom(_:)), keyEquivalent: "")
        windowMenuItem.submenu = windowMenu
        mainMenu.addItem(windowMenuItem)

        NSApp.mainMenu = mainMenu
    }

    func setupWindow() {
        let initialRect = NSRect(x: 0, y: 0, width: 1320, height: 860)
        window = NSWindow(
            contentRect: initialRect,
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        window.title = "DevNotes"
        window.titleVisibility = .hidden
        window.titlebarAppearsTransparent = true
        window.backgroundColor = NSColor(red: 0.04, green: 0.06, blue: 0.09, alpha: 1.0)
        window.minSize = NSSize(width: 840, height: 600)
        window.center()
        window.isReleasedWhenClosed = false
        window.isMovableByWindowBackground = true

        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        config.setValue(true, forKey: "allowUniversalAccessFromFileURLs")
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")

        // Register native window drag message handler
        config.userContentController.add(self, name: "performWindowDrag")

        let dragScript = """
        window.addEventListener('mousedown', function(e) {
            if (e.button !== 0) return;
            var target = e.target;
            if (!target) return;
            if (target.closest('button, input, textarea, select, a, [data-no-drag], .cm-editor, .studio-lang-dropdown-menu, .studio-lang-selector-btn, .modal-content, .slash-menu-container')) {
                return;
            }
            var dragArea = target.closest('.top-navbar, .sidebar-header, .macos-titlebar, .macos-traffic-light-spacer, .macos-address-capsule, [data-drag-region]');
            if (dragArea) {
                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.performWindowDrag) {
                    window.webkit.messageHandlers.performWindowDrag.postMessage('drag');
                }
            }
        }, true);
        """
        let userScript = WKUserScript(source: dragScript, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        config.userContentController.addUserScript(userScript)

        webView = WKWebView(frame: window.contentView!.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.navigationDelegate = self
        webView.uiDelegate = self

        // Clean dark background for webview
        webView.setValue(false, forKey: "drawsBackground")

        window.contentView?.addSubview(webView)
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "performWindowDrag", let event = NSApp.currentEvent {
            if event.clickCount == 2 {
                window.zoom(nil)
            } else {
                window.performDrag(with: event)
            }
        }
    }

    func loadAppContent() {
        // Look for dist inside Bundle Resources
        if let resourceURL = Bundle.main.resourceURL {
            let distURL = resourceURL.appendingPathComponent("dist")
            let indexURL = distURL.appendingPathComponent("index.html")
            
            if FileManager.default.fileExists(atPath: indexURL.path) {
                webView.loadFileURL(indexURL, allowingReadAccessTo: resourceURL)
                return
            }
        }

        // Fallback for local development
        let localIndex = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
            .appendingPathComponent("dist")
            .appendingPathComponent("index.html")
            
        if FileManager.default.fileExists(atPath: localIndex.path) {
            webView.loadFileURL(localIndex, allowingReadAccessTo: localIndex.deletingLastPathComponent())
        } else {
            // Local dev server fallback
            if let devURL = URL(string: "http://localhost:5173/") {
                webView.load(URLRequest(url: devURL))
            }
        }
    }

    @objc func reloadWebView() {
        webView.reload()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
