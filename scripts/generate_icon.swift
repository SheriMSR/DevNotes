import Cocoa

func generateIcon(outputPath: String) {
    let size = NSSize(width: 1024, height: 1024)
    let image = NSImage(size: size)
    
    image.lockFocus()
    
    // Background Rounded Rect with vibrant gradient
    let rect = NSRect(origin: .zero, size: size)
    let path = NSBezierPath(roundedRect: rect.insetBy(dx: 30, dy: 30), xRadius: 220, yRadius: 220)
    
    let gradient = NSGradient(colors: [
        NSColor(red: 0.388, green: 0.400, blue: 0.945, alpha: 1.0), // #6366f1
        NSColor(red: 0.659, green: 0.333, blue: 0.969, alpha: 1.0)  // #a855f7
    ])!
    
    gradient.draw(in: path, angle: -45)
    
    // Inner shadow ring
    let strokeColor = NSColor(white: 1.0, alpha: 0.25)
    strokeColor.setStroke()
    path.lineWidth = 12
    path.stroke()
    
    // Code symbol "< / >"
    let text = "< / >"
    let font = NSFont.monospacedSystemFont(ofSize: 320, weight: .bold)
    let attrs: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: NSColor.white,
        .shadow: {
            let s = NSShadow()
            s.shadowColor = NSColor(white: 0.0, alpha: 0.4)
            s.shadowOffset = NSSize(width: 0, height: -10)
            s.shadowBlurRadius = 20
            return s
        }()
    ]
    
    let str = NSAttributedString(string: text, attributes: attrs)
    let textSize = str.size()
    let textOrigin = NSPoint(x: (size.width - textSize.width) / 2, y: (size.height - textSize.height) / 2)
    str.draw(at: textOrigin)
    
    image.unlockFocus()
    
    if let tiff = image.tiffRepresentation,
       let rep = NSBitmapImageRep(data: tiff),
       let pngData = rep.representation(using: .png, properties: [:]) {
        try? pngData.write(to: URL(fileURLWithPath: outputPath))
        print("Generated icon at: \(outputPath)")
    }
}

let args = CommandLine.arguments
let output = args.count > 1 ? args[1] : "icon.png"
generateIcon(outputPath: output)
