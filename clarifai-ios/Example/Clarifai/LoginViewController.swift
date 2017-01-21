import Foundation
import UIKit

@objc class LoginViewController: UIViewController
{
    @IBOutlet weak var userTextField: UITextField!
    @IBOutlet weak var passTextField: UITextField!
    
    @IBAction func loginButtonAction(_ sender: UIButton) {
        
        let username = userTextField
        let password = passTextField
        let loginString = String(format: "%@:%@", username!, password!)
        let loginData = loginString.data(using: String.Encoding.utf8)!
        let base64LoginString = loginData.base64EncodedString()
        
        // create the request
        let url = URL(string: "https://blooming-headland-37255.herokuapp.com/api/signup")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Basic \(base64LoginString)", forHTTPHeaderField: "Authorization")
        
        // fire off the request
        // make sure your class conforms to NSURLConnectionDelegate
        _ = NSURLConnection(request: request, delegate: self)
    }
    
    var data: NSMutableData = NSMutableData()
    
    func connection(connection: NSURLConnection!, didFailWithError error: NSError!) {
        print("Failed with error:\(error.localizedDescription)")
    }
    
    //NSURLConnection delegate method
    func connection(didReceiveResponse: NSURLConnection!, didReceiveResponse response: URLResponse!) {
        //New request so we need to clear the data object
        self.data = NSMutableData()
    }
    
    //NSURLConnection delegate method
    func connection(connection: NSURLConnection!, didReceiveData data: NSData!) {
        //Append incoming data
        self.data.append(data as Data)
    }
}
