import Foundation
import UIKit
import SwiftHTTP
import JSONJoy

public var TOKEN = String()

@objc public class AppConstant:NSObject{
    private override init() {}
    class func toke() -> String { return TOKEN }
}

public class TagConstant {
    public var tag = String()
}

@objc class LoginViewController: UIViewController
{
    @IBOutlet weak var userTextField: UITextField!
    @IBOutlet weak var passTextField: UITextField!
    
    @IBAction func loginButtonAction(_ sender: UIButton) {
        let username = userTextField.text
        let password = passTextField.text
        let params = ["name": username!, "password": password!]
        print(username!)
        print(password!)
        
        struct Response: JSONJoy {
            let token: String
            init(_ decoder: JSONDecoder) throws {
                token = try decoder["token"].get()
            }
        }
        
        // POST the username and password
        
        do {
            let opt = try HTTP.POST("https://afternoon-meadow-50393.herokuapp.com/api/authenticate", parameters: params)
            opt.start { response in
                do {
                    let resp = try Response(JSONDecoder(response.data))
                    print(resp.token)
                    TOKEN = resp.token
                    print(TOKEN)
                } catch {
                    print("unable to parse the JSON")
                }
                self.dismiss(animated: true, completion: nil)
            }
        } catch let error {
            print("got an error creating the request: \(error)")
        }
        /*
        do {
            let opt = try HTTP.GET("https://google.com")
            opt.start { response in
                if let err = response.error {
                    print("error: \(err.localizedDescription)")
                    return //also notify app of failure as needed
                }
                print("opt finished: \(response.description)")
                //print("data is: \(response.data)") access the response of the data with response.data
            }
        } catch let error {
            print("got an error creating the request: \(error)")
        }
         */
        
    }
    
}
