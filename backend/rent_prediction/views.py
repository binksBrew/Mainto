# # rent_prediction/views.py

# import joblib
# import numpy as np
# import os
# from rest_framework.decorators import api_view
# from rest_framework.response import Response

# # Load the trained model and feature names
# BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# model_path = os.path.join(BASE_DIR, 'rent_prediction', 'ml_models', 'rent_prediction_model.pkl')
# model = joblib.load(model_path)

# # Define the exact feature names used during training
# FEATURES = [
#     "Total_Beds", "Bathrooms", "Kitchen", "Living_Area", "Dining_Area", "Workspace",
#     "Parking", "Security_Features", "Community_Facilities",
#     "Property_Type_Commercial", "Property_Type_Residential",
#     "City_Mumbai", "City_Delhi", "City_Bengaluru", "City_Hyderabad",
#     "City_Ahmedabad", "City_Chennai", "City_Kolkata", "City_Pune",
#     "City_Jaipur", "City_Lucknow"
# ]

# @api_view(['POST'])
# def predict_rent_view(request):
#     try:
#         # Extract input features from the request data
#         features = request.data

#         # Initialize feature dictionary with default values (0 for numerical, 0 for one-hot encoded)
#         feature_dict = {feature: 0 for feature in FEATURES}

#         # Update feature dictionary with the input data
#         feature_dict.update({
#             "Total_Beds": features["Total_Beds"],
#             "Bathrooms": features["Bathrooms"],
#             "Kitchen": features["Kitchen"],
#             "Living_Area": features["Living_Area"],
#             "Dining_Area": features["Dining_Area"],
#             "Workspace": features["Workspace"],
#             "Parking": features["Parking"],
#             "Security_Features": features["Security_Features"],
#             "Community_Facilities": features["Community_Facilities"],
#             f"Property_Type_{features['Property_Type']}": 1,  # One-hot encode Property_Type
#             f"City_{features['City']}": 1  # One-hot encode City
#         })

#         # Convert the dictionary to a feature vector (aligned with the training schema)
#         feature_vector = np.array([list(feature_dict.values())])

#         # Predict the rent
#         predicted_rent = model.predict(feature_vector)[0]
#         return Response({"predicted_rent": predicted_rent}, status=200)

#     except KeyError as e:
#         return Response({"error": f"Missing key: {str(e)}"}, status=400)
#     except Exception as e:
#         return Response({"error": str(e)}, status=400)







import joblib
import numpy as np
import os
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Load the trained model and feature names
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(BASE_DIR, 'rent_prediction', 'ml_models', 'rent_prediction_model.pkl')
model = joblib.load(model_path)

# Define the exact feature names used during training
FEATURES = [
    "Total_Beds", "Bathrooms", "Kitchen", "Living_Area", "Dining_Area", "Workspace",
    "Parking", "Security_Features", "Community_Facilities",
    "Property_Type_Commercial", "Property_Type_Residential",
    "City_Mumbai", "City_Delhi", "City_Bengaluru", "City_Hyderabad",
    "City_Ahmedabad", "City_Chennai", "City_Kolkata", "City_Pune",
    "City_Jaipur", "City_Lucknow"
]

@api_view(['POST'])
def predict_rent_view(request):
    try:
        # Extract input features from the request data
        features = request.data

        # Initialize feature dictionary with default values (0 for numerical, 0 for one-hot encoded)
        feature_dict = {feature: 0 for feature in FEATURES}

        # Update feature dictionary with the input data
        feature_dict.update({
            "Total_Beds": features.get("Total_Beds", 0),
            "Bathrooms": features.get("Bathrooms", 0),
            "Kitchen": features.get("Kitchen", 0),
            "Living_Area": features.get("Living_Area", 0),
            "Dining_Area": features.get("Dining_Area", 0),
            "Workspace": features.get("Workspace", 0),
            "Parking": features.get("Parking", 0),
            "Security_Features": features.get("Security_Features", 0),
            "Community_Facilities": features.get("Community_Facilities", 0),
            f"Property_Type_{features.get('Property_Type', 'Residential')}": 1,  # One-hot encode Property_Type
            f"City_{features.get('City', 'Mumbai')}": 1  # One-hot encode City
        })

        # Convert the dictionary to a feature vector (aligned with the training schema)
        feature_vector = np.array([list(feature_dict.values())])

        # Predict the rent
        predicted_rent = model.predict(feature_vector)[0]
        return Response({"predicted_rent": predicted_rent}, status=200)

    except KeyError as e:
        return Response({"error": f"Missing key: {str(e)}"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
