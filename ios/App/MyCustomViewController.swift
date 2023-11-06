//
//  MyCustomViewController.swift
//  App
//
//  Created by Paul Miller on 9/6/23.
//

import UIKit
import Capacitor

class MyCustomViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        webView!.allowsBackForwardNavigationGestures = true
        webView!.scrollView.bounces = false
        webView!.scrollView.alwaysBounceVertical = false
        webView!.scrollView.showsVerticalScrollIndicator = false
    }
}
