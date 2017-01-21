//
//  ViewController.swift
//  CameraApp
//
//  Created by Sen Huang on 1/21/17.
//  Copyright © 2017 boolaboola. All rights reserved.
//

import UIKit

class ViewController: UIViewController, UIImagePickerControllerDelegate, UINavigationControllerDelegate{

    @IBOutlet weak var pickedImage: UIImageView!
    
    @IBAction func snapPhoto(_ sender: UIButton) {
        
        if UIImagePickerController.isSourceTypeAvailable(UIImagePickerControllerSourceType.camera)    // Stay safe from crashing
        {
            let imagePicker = UIImagePickerController()
            imagePicker.delegate = self
            imagePicker.sourceType = UIImagePickerControllerSourceType.camera;   // Use the camera
            imagePicker.allowsEditing = false
            self.present(imagePicker, animated: true, completion: nil)      // UIImage! gives us the unwrapped image
        }
    }
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingImage image: UIImage!, editingInfo:[NSObject : AnyObject]!) {
        pickedImage.image = image
        self.dismiss(animated: true, completion: nil);
    }


}

