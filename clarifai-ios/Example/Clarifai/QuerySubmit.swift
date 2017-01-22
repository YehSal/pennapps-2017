//
//  QuerySubmit.swift
//  Clarifai
//
//  Created by Sen Huang on 1/21/17.
//  Copyright © 2017 Clarifai, Inc. All rights reserved.
//

import Foundation
import UIKit
import JSONJoy
import SwiftHTTP

class QuerySubmit: UIViewController {
    
    var finalTag = NSString()
    
    @IBOutlet weak var tagDisplay: UILabel!
    
    @IBOutlet weak var Label1: UILabel!
    @IBOutlet weak var Label2: UILabel!
    @IBOutlet weak var Label3: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
    
        struct Disease: JSONJoy {
            let name: String
            let threshold: Float
            let realval: Float
            let percentage: Float
            
            init(_ decoder: JSONDecoder) throws {
                name = try decoder["name"].get()
                threshold = try decoder["threshold"].get()
                realval = try decoder["realval"].get()
                percentage = try decoder["percentage"].get()
            }
        }
        
        struct Problems: JSONJoy {
            let fat: Disease
            let sodium: Disease
            
            init(_ decoder: JSONDecoder) throws {
                fat = try decoder["fat"].get()
                sodium = try decoder["sodium"].get()
            }
        }
        
        struct Something: JSONJoy {
            let analyses: Problems
            
            init(_ decoder: JSONDecoder) throws {
                analyses = try decoder["fat"].get()
            }
        }
        
        let finalfinalTag = finalTag as String
        let params = ["food": finalfinalTag]
        let headers = ["Authorization": TOKEN]
        
        
        
        do {
            let opt = try HTTP.POST("https://afternoon-meadow-50393.herokuapp.com/api/manalyze", parameters: params, headers: headers)
            opt.start { response in
                do {
                    let info = try Something(JSONDecoder(response.data))
                    print(response.text)
                    let fatinfo = info.analyses.fat.name
                    let sodiuminfo = info.analyses.sodium.name
                    print(fatinfo)
                    if fatinfo != nil {
                        self.Label1.text! = "Fat"
                    }
                    if sodiuminfo != nil {
                        self.Label2.text! = "Sodium"
                    }
                    print(sodiuminfo)
                } catch {
                    print("Unable to parse JSON")
                }
            }
        } catch {
            print("Error processing request")
        }
        
    }
}
