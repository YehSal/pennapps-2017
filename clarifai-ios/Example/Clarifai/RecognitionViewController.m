//
//  RecognitionViewController.m
//  ClarifaiApiDemo
//

#import "RecognitionViewController.h"
#import "ClarifaiApp.h"

/**
 * This view controller performs recognition using the Clarifai API.
 * See the README for instructions on running the demo.
 */
@interface RecognitionViewController () <UINavigationControllerDelegate, UIImagePickerControllerDelegate, UIPickerViewDelegate, UIPickerViewDataSource>
@property (weak, nonatomic) IBOutlet UIImageView *imageView;
@property (weak, nonatomic) IBOutlet UIPickerView *pickerView;
@property (weak, nonatomic) IBOutlet UIButton *button;
@property (strong, nonatomic) ClarifaiApp *app;
@end


@implementation RecognitionViewController
NSArray *_pickerViewData;
NSString * sentTag;

- (void)viewDidLoad
{
    [super viewDidLoad];
    _pickerViewData = @[@"Item 1", @"Item 2", @"Item 3", @"Item 4", @"Item 5", @"Item 6", @"Item 7", @"Item 8", @"Item 9", @"Item 10"];
    
    self.pickerView.dataSource = self;
    self.pickerView.delegate = self;
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
}

- (NSInteger)numberOfComponentsInPickerView:(UIPickerView *)pickerView
{
    return 1;
}

- (NSInteger)pickerView:(UIPickerView *)pickerView numberOfRowsInComponent:(NSInteger)component
{
    return _pickerViewData.count;
}

- (NSString*)pickerView:(UIPickerView *)pickerView titleForRow:(NSInteger)row forComponent:(NSInteger)component
{
    return _pickerViewData[row];
}

// Catpure the picker view selection
- (void)pickerViewSelection:(UIPickerView *)pickerViewSelection didSelectRow:(NSInteger)row inComponent:(NSInteger)component
{
    // This method is triggered whenever the user makes a change to the picker selection.
    // The parameter named row and component represents what was selected.
}

- (IBAction)cameraAction:(UIButton *)sender {
    UIImagePickerController *picker = [[UIImagePickerController alloc] init];
    picker.sourceType = UIImagePickerControllerSourceTypeCamera;
    picker.allowsEditing = NO;
    picker.delegate = self;
    [self presentViewController:picker animated:YES completion:nil];
}   // Camera shit

- (IBAction)sendTag:(UIButton *)sender {
    NSInteger row;
    NSArray *repeatPickerData;
    UIPickerView *repeatPickerView;
    
    row = [repeatPickerView selectedRowInComponent:0];
    // self.strPrintRepeat = [repeatPickerData objectAtIndex:row];
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController *)picker {
    [self dismissViewControllerAnimated:YES completion:nil];
}

- (void)imagePickerController:(UIImagePickerController *)picker didFinishPickingMediaWithInfo:(NSDictionary *)info {
    [self dismissViewControllerAnimated:YES completion:nil];
    UIImage *image = info[UIImagePickerControllerOriginalImage];
    if (image) {
        // The user picked an image. Send it to Clarifai for recognition.
        self.imageView.image = image;
        self.button.enabled = NO;
        [self recognizeImage:image];
    }
}

- (void)recognizeImage:(UIImage *)image {

    // Initialize the Clarifai app with your app's ID and Secret.
    ClarifaiApp *app = [[ClarifaiApp alloc] initWithAppID:@"gvUm6Nw22r5DuLFh8dXuH2DqFW8LqYBBcdpL4NME"
                                                appSecret:@"wpCS7UCeZmY7Nx74Yku4_5C61X_MJGnOZczy_gj8"];
  
    // Fetch Clarifai's general model.
    [app getModelByName:@"general-v1.3" completion:^(ClarifaiModel *model, NSError *error) {
        // Create a Clarifai image from a uiimage.
        ClarifaiImage *clarifaiImage = [[ClarifaiImage alloc] initWithImage:image];
        
        // Use Clarifai's general model to pedict tags for the given image.
        [model predictOnImages:@[clarifaiImage] completion:^(NSArray<ClarifaiOutput *> *outputs, NSError *error) {
            if (!error) {
                ClarifaiOutput *output = outputs[0];
                
                // Loop through predicted concepts (tags), and display them on the screen.
                NSMutableArray *tags = [NSMutableArray array];
                for (ClarifaiConcept *concept in output.concepts) {
                    [tags addObject:concept.conceptName];
                }
                NSArray *array = [tags copy];
                _pickerViewData = [array copy];
                /*
                dispatch_async(dispatch_get_main_queue(), ^{
                    self.textView.text = [NSString stringWithFormat:@"Tags:\n%@", [tags componentsJoinedByString:@", "]];
                })*/;
            }
        }];
    }];
}

@end
